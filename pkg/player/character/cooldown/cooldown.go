// Package cooldown provides default implementation for SetCD, SetCDWithDelay, ResetActionCooldown, ReduceActionCooldown, ActionReady,
package cooldown

import (
	"fmt"

	"github.com/genshinsim/gcsim/pkg/core/glog"
	"github.com/genshinsim/gcsim/pkg/player"
)

type Handler struct {
	c                      *player.MasterChar
	ActionCD               []int
	cdQueueWorkerStartedAt []int
	cdCurrentQueueWorker   []*func()
	cdQueue                [][]int
	AvailableCDCharge      []int
	additionalCDCharge     []int
}

//SetCD takes two parameters:
//	- a player.Action: this is the action type we are triggering the cooldown for
//  - dur: duration in frames that the cooldown should last for
//It is assumed that AvailableCDCharges[a] > 0 (otherwise action should not have been allowed)
//
//SetCD works by adding the cooldown duration to a queue. This is because when there are
//multiple charges, the game will first finish recharging the first charge before starting
//the full cooldown for the second charge.
//
//When a cooldown is added to queue for the first time, a queue worker is started. This queue
//worker will check back at the cooldown specified for the first queued item, and if the queued
//cooldown did not change, it will increment the number of charges by 1, and reschedule itself
//to check back for the next item in queue
//
//Sometimes, the queued cooldown gets adjusted via ReduceActionCooldown or ResetActionCooldown.
//When this happens, the initial queued worker will check back at the wrong time. To prevent this,
//we use cdQueueWorkerStartedAt[a] which tracks the frame the worker started at. So when
//ReduceActionCooldown or ResetActionCooldown gets called, we start a new worker, updating
//cdQueueWorkerStartedAt[a] to represent the new worker start frame. This way the old worker can
//check this value first and then gracefully exit if it no longer matches its starting frame
func (h *Handler) SetCD(a player.Action, dur int) {
	//setting cd is just adding a cd to the recovery queue
	//add current action and duration to the queue
	h.cdQueue[a] = append(h.cdQueue[a], dur)
	//if queue is zero before we added to it, then we'll start a cooldown queue worker
	if len(h.cdQueue[a]) == 1 {
		h.startCooldownQueueWorker(a, true)
	}
	//make sure to remove one from stack count
	h.AvailableCDCharge[a]--
	if h.AvailableCDCharge[a] < 0 {
		panic("unexpected charges less than 0")
	}
	//TODO: remove these tags; add special syntax just to check for charges instead of using tags
	if h.c.Tags["skill_charge"] > 0 {
		h.c.Tags["skill_charge"]--
	}
	h.c.Player.Core.Log.NewEventBuildMsg(
		glog.LogActionEvent,
		h.c.Index,
		a.String(), " cooldown triggered",
	).Write(
		"type", a.String(),
		"expiry", h.Cooldown(a),
		"charges_remain", h.AvailableCDCharge,
		"cooldown_queue", h.cdQueue,
	)
}

func (h *Handler) SetNumCharges(a player.Action, num int) {
	h.additionalCDCharge[a] = num - 1
	h.AvailableCDCharge[a] = num
}

func (h *Handler) Charges(a player.Action) int {
	return h.AvailableCDCharge[a]
}

func (h *Handler) ActionReady(a player.Action, p map[string]int) bool {
	//up if energy is ready && stack > 0
	if a == player.ActionBurst && (h.c.Energy != h.c.EnergyMax) {
		return false
	}
	return h.AvailableCDCharge[a] > 0
}

func (c *Handler) SetCDWithDelay(a player.Action, dur int, delay int) {
	if delay == 0 {
		c.SetCD(a, dur)
		return
	}
	c.c.Player.Core.Tasks.Add(func() { c.SetCD(a, dur) }, delay)
}

func (c *Handler) Cooldown(a player.Action) int {
	//remaining cooldown is src + first item in queue - current frame
	if c.AvailableCDCharge[a] > 0 {
		return 0
	}
	//otherwise check our queue; if zero then it's ready
	if len(c.cdQueue) == 0 {
		// panic("queue length is somehow 0??")
		return 0
	}
	return c.cdQueueWorkerStartedAt[a] + c.cdQueue[a][0] - c.c.Player.Core.F
}

func (h *Handler) ResetActionCooldown(a player.Action) {
	//if stacks already maxed then do nothing
	if h.AvailableCDCharge[a] == 1+h.additionalCDCharge[a] {
		return
	}
	//log.Printf("resetting; frame %v, queue %v\n", c.F, c.cdQueue[a])
	//otherwise add a stack && pop queue
	h.AvailableCDCharge[a]++
	h.c.Tags["skill_charge"]++
	h.cdQueue[a] = h.cdQueue[a][1:]
	//reset worker time
	h.cdQueueWorkerStartedAt[a] = h.c.Player.Core.F
	h.cdCurrentQueueWorker[a] = nil
	h.c.Player.Core.Log.NewEventBuildMsg(
		glog.LogActionEvent,
		h.c.Index,
		a.String(), " cooldown forcefully reset",
	).Write(
		"type", a.String(),
		"charges_remain", h.AvailableCDCharge,
		"cooldown_queue", h.cdQueue,
	)
	//check if anymore cd in queue
	if len(h.cdQueue) > 0 {
		h.startCooldownQueueWorker(a, true)
	}
}

func (h *Handler) ReduceActionCooldown(a player.Action, v int) {
	//do nothing if stacks already maxed
	if h.AvailableCDCharge[a] == 1+h.additionalCDCharge[a] {
		return
	}
	//check if reduction > time remaing? if so then call reset cd
	remain := h.cdQueueWorkerStartedAt[a] + h.cdQueue[a][0] - h.c.Player.Core.F
	//log.Printf("hello reducing; reduction %v, remaining %v, frame %v, old queue %v\n", v, remain, c.F, c.cdQueue[a])
	if v >= remain {
		h.ResetActionCooldown(a)
		return
	}
	//otherwise reduce remain and restart queue
	h.cdQueue[a][0] = remain - v
	h.c.Player.Core.Log.NewEventBuildMsg(
		glog.LogActionEvent,
		h.c.Index,
		a.String(), " cooldown forcefully reduced",
	).Write(
		"type", a.String(),
		"expiry", h.Cooldown(a),
		"charges_remain", h.AvailableCDCharge,
		"cooldown_queue", h.cdQueue,
	)
	h.startCooldownQueueWorker(a, false)
	//log.Printf("started: %v, new queue: %v, worker frame: %v\n", c.cdQueueWorkerStartedAt[a], c.cdQueue[a], c.cdQueueWorkerStartedAt[a])
}

func (h *Handler) startCooldownQueueWorker(a player.Action, cdReduct bool) {
	//check the length of the queue for action a, if there's nothing then there's
	//nothing to start
	if len(h.cdQueue[a]) == 0 {
		return
	}

	//set the time we starter this worker at
	h.cdQueueWorkerStartedAt[a] = h.c.Player.Core.F
	var src *func()

	//reduce the first item by the current cooldown reduction
	if cdReduct {
		h.cdQueue[a][0] = h.c.CDReduction(a, h.cdQueue[a][0])
	}

	worker := func() {
		//check if src changed; if so do nothing
		if src != h.cdCurrentQueueWorker[a] {
			// c.Log.Debugw("src changed",  "src", src, "new", c.cdQueueWorkerStartedAt[a])
			return
		}
		//log.Printf("cd worker triggered, started; %v, queue: %v\n", c.cdQueueWorkerStartedAt[a], c.cdQueue[a])
		//check to make sure queue is not 0
		if len(h.cdQueue[a]) == 0 {
			//this should never happen
			panic(fmt.Sprintf("queue is empty? character :%v, frame : %v, worker src: %v, started: %v", h.c.Base.Key.String(), h.c.Player.Core.F, src, h.cdQueueWorkerStartedAt[a]))
			// return
		}
		//otherwise add a stack and pop first item in queue
		h.AvailableCDCharge[a]++
		h.c.Tags["skill_charge"]++
		h.cdQueue[a] = h.cdQueue[a][1:]

		// c.Log.Debugw("stack restored",  "avail", c.availableCDCharge[a], "queue", c.cdQueue)

		if h.AvailableCDCharge[a] > 1+h.additionalCDCharge[a] {
			//sanity check, this should never happen
			panic(fmt.Sprintf("charges > max? character :%v, frame : %v", h.c.Base.Key.String(), h.c.Player.Core.F))
			// c.availableCDCharge[a] = 1 + c.additionalCDCharge[a]
			// return
		}

		h.c.Player.Core.Log.NewEventBuildMsg(
			glog.LogActionEvent,
			h.c.Index,
			a.String(), " cooldown ready",
		).Write(
			"type", a.String(),
			"charges_remain", h.AvailableCDCharge,
			"cooldown_queue", h.cdQueue,
		)

		//if queue still has len > 0 then call start queue again
		if len(h.cdQueue) > 0 {
			h.startCooldownQueueWorker(a, true)
		}

	}

	h.cdCurrentQueueWorker[a] = &worker
	src = &worker

	//wait for c.cooldownQueue[a][0], then add a stack
	h.c.Player.Core.Tasks.Add(worker, h.cdQueue[a][0])

}