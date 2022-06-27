package flute

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
	core.RegisterWeaponFunc(keys.TheFlute, NewWeapon)
}

//Normal or Charged Attacks grant a Harmonic on hits. Gaining 5 Harmonics triggers the
//power of music and deals 100% ATK DMG to surrounding opponents. Harmonics last up to 30s,
//and a maximum of 1 can be gained every 0.5s.
type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p weapon.WeaponProfile) (weapon.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	expiry := 0
	stacks := 0
	icd := 0

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
		icd = c.F + 30 // every .5 sec
		if expiry < c.F {
			stacks = 0
		}
		stacks++
		expiry = c.F + 1800 //stacks lasts 30s

		if stacks == 5 {
			//trigger dmg at 5 stacks
			stacks = 0
			expiry = 0

			ai := combat.AttackInfo{
				ActorIndex: char.Index,
				Abil:       "Flute Proc",
				AttackTag:  combat.AttackTagWeaponSkill,
				ICDTag:     combat.ICDTagNone,
				ICDGroup:   combat.ICDGroupDefault,
				Element:    attributes.Physical,
				Durability: 100,
				Mult:       0.75 + 0.25*float64(r),
			}
			c.QueueAttack(ai, combat.NewDefCircHit(2, false, combat.TargettableEnemy), 0, 1)

		}
		return false
	}, fmt.Sprintf("flute-%v", char.Base.Key.String()))
	return w, nil
}