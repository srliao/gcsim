package whiteblind

import (
	"fmt"

	"github.com/genshinsim/gcsim/pkg/core"
	"github.com/genshinsim/gcsim/pkg/core/attributes"
	"github.com/genshinsim/gcsim/pkg/core/combat"
	"github.com/genshinsim/gcsim/pkg/core/event"
	"github.com/genshinsim/gcsim/pkg/core/keys"
	"github.com/genshinsim/gcsim/pkg/core/player/character"
	"github.com/genshinsim/gcsim/pkg/core/player/weapon"
)

func init() {
	core.RegisterWeaponFunc(keys.Whiteblind, NewWeapon)
}

type Weapon struct {
	Index  int
	stacks int
	buff   []float64
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p weapon.WeaponProfile) (weapon.Weapon, error) {
	//On hit, Normal or Charged Attacks increase ATK and DEF by 6% for 6s. Max 4
	//stacks. This effect can only occur once every 0.5s.
	w := &Weapon{}
	r := p.Refine

	icd := 0
	activeUntil := -1
	w.buff = make([]float64, attributes.EndStatType)
	amt := 0.045 + float64(r)*0.015

	c.Events.Subscribe(event.OnDamage, func(args ...interface{}) bool {
		atk := args[1].(*combat.AttackEvent)
		if atk.Info.ActorIndex != char.Index {
			return false
		}
		if atk.Info.AttackTag != combat.AttackTagNormal && atk.Info.AttackTag != combat.AttackTagExtra {
			return false
		}
		if icd > c.F {
			return false
		}
		if activeUntil < c.F {
			w.stacks = 0
		}

		activeUntil = c.F + 360
		icd = c.F + 30

		if w.stacks < 4 {
			w.stacks++
			//update buff
			w.buff[attributes.ATKP] = amt * float64(w.stacks)
			w.buff[attributes.DEFP] = amt * float64(w.stacks)
		}

		//refresh mod
		char.AddStatMod("whiteblind", 360, attributes.NoStat, func() ([]float64, bool) {
			return w.buff, true
		})

		return false
	}, fmt.Sprintf("whiteblind-%v", char.Base.Key.String()))

	return w, nil
}