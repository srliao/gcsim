package player

import (
	"errors"

	"github.com/genshinsim/gcsim/pkg/core/action"
	"github.com/genshinsim/gcsim/pkg/core/event"
	"github.com/genshinsim/gcsim/pkg/core/glog"
	"github.com/genshinsim/gcsim/pkg/core/keys"
)

//ErrActionNotReady is returned if the requested action is not ready; this could be
//due to any of the following:
//	- Insufficient energy (burst only)
//	- Ability on cooldown
//	- Player currently in animation
var ErrActionNotReady = errors.New("action is not ready yet; cannot be executed")
var ErrPlayerNotReady = errors.New("player still in animation; cannot execute action")
var ErrActionNoOp = errors.New("action is a noop")

//Exec mirrors the idea of the in game buttons where you can press the button but
//it may be greyed out. If grey'd out it will return ErrActionNotReady. Otherwise
//if action was executed successfully then it will return nil
//
//The function takes 2 params:
//	- ActionType
//	- Param
//
//Just like in game this will always try and execute on the currently active character
//
//This function can be called as many times per frame as desired. However, it will only
//execute if the animation state allows for it
//
//Note that although wait is not strictly a button in game, it is still a valid action.
//When wait is executed, it will simply put the player in a lock animation state for
//the requested number of frames
func (p *Handler) Exec(t action.Action, k keys.Char, param map[string]int) error {
	//check animation state
	if p.IsAnimationLocked(t) {
		return ErrPlayerNotReady
	}

	char := p.chars[p.active]
	//check for energy, cd, etc..
	//TODO: make sure there is a default check for charge attack/dash stams in char implementation
	//this should deal with Ayaka/Mona's drain vs straight up consumption
	if !char.ActionReady(t, param) {
		return ErrActionNotReady
	}

	stamCheck := func(t action.Action, param map[string]int) (float64, bool) {
		req := p.StamPercentMod(t) * char.ActionStam(t, param)
		return req, p.Stam >= req
	}

	switch t {
	case action.ActionCharge: //require special calc for stam
		amt, ok := stamCheck(t, param)
		if !ok {
			p.log.NewEvent("insufficient stam: charge attack", glog.LogSimEvent, -1, "have", p.Stam, "cost", amt)
			return ErrActionNotReady
		}
		//use stam
		p.Stam -= amt
		p.LastStamUse = *p.f
		p.events.Emit(event.OnStamUse, t)
		p.useAbility(t, param, char.ChargeAttack) //TODO: make sure characters are consuming stam in charge attack function
	case action.ActionDash: //require special calc for stam
		//dash handles it in the action itself
		amt, ok := stamCheck(t, param)
		if !ok {
			p.log.NewEvent("insufficient stam: dash", glog.LogSimEvent, -1, "have", p.Stam, "cost", amt)
			return ErrActionNotReady
		}
		p.useAbility(t, param, char.Dash) //TODO: make sure characters are consuming stam in dashes
	case action.ActionJump:
		p.useAbility(t, param, char.Jump)
	case action.ActionWalk:
		p.useAbility(t, param, char.Walk)
	case action.ActionAim:
		p.useAbility(t, param, char.Aimed)
	case action.ActionSkill:
		p.useAbility(t, param, char.Skill)
	case action.ActionBurst:
		p.useAbility(t, param, char.Burst)
	case action.ActionAttack:
		p.useAbility(t, param, char.Attack)
	case action.ActionHighPlunge:
		//TODO: there should be a flag that says airborne and only then can you plunge
		p.useAbility(t, param, char.HighPlungeAttack)
	case action.ActionLowPlunge:
		p.useAbility(t, param, char.LowPlungeAttack)
	case action.ActionSwap:
		if p.active == p.charPos[k] {
			return ErrActionNoOp
		}
		if p.SwapCD > 0 {
			return ErrActionNotReady
		}
		//otherwise swap at the end of timer

		x := action.ActionInfo{
			Frames: func(next action.Action) int {
				return p.delays.Swap
			},
			AnimationLength: p.delays.Swap,
			CanQueueAfter:   p.delays.Swap,
			State:           action.SwapState,
		}
		x.QueueAction(p.swap(k), p.delays.Swap)
		x.CacheFrames()
		p.SetActionUsed(p.active, &x)
		p.LastAction.Type = t
		p.LastAction.Param = param
		p.LastAction.Char = p.active
	default:
		panic("invalid action reached")
	}

	if t != action.ActionAttack {
		p.ResetAllNormalCounter()
	}

	p.events.Emit(event.OnActionExec, p.active, t, param)

	return nil
}

var actionToEvent = map[action.Action]event.Event{
	action.ActionDash:       event.OnDash,
	action.ActionSkill:      event.OnSkill,
	action.ActionBurst:      event.OnBurst,
	action.ActionAttack:     event.OnAttack,
	action.ActionCharge:     event.OnChargeAttack,
	action.ActionLowPlunge:  event.OnPlunge,
	action.ActionHighPlunge: event.OnPlunge,
	action.ActionAim:        event.OnAimShoot,
}

func (p *Handler) useAbility(
	t action.Action,
	param map[string]int,
	f func(p map[string]int) action.ActionInfo,
) {
	state, ok := actionToEvent[t]
	if ok {
		p.events.Emit(state)
	}
	info := f(param)
	info.CacheFrames()
	p.SetActionUsed(p.active, &info)

	p.LastAction.Type = t
	p.LastAction.Param = param
	p.LastAction.Char = p.active

	p.log.NewEventBuildMsg(
		glog.LogActionEvent,
		p.active,
		"executed ", t.String(),
	).Write(
		"action", t.String(),
	)

}
