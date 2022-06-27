package freedom

import (
	"github.com/genshinsim/gcsim/pkg/core"
	"github.com/genshinsim/gcsim/pkg/core/attributes"
	"github.com/genshinsim/gcsim/pkg/core/combat"
	"github.com/genshinsim/gcsim/pkg/core/event"
	"github.com/genshinsim/gcsim/pkg/core/glog"
	"github.com/genshinsim/gcsim/pkg/core/keys"
	"github.com/genshinsim/gcsim/pkg/core/player/character"
	"github.com/genshinsim/gcsim/pkg/core/player/weapon"
)

func init() {
	core.RegisterWeaponFunc(keys.FreedomSworn, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p weapon.WeaponProfile) (weapon.Weapon, error) {
	//A part of the "Millennial Movement" that wanders amidst the winds.
	//Increases DMG by 10%. When the character wielding this weapon triggers
	//Elemental Reactions, they gain a Sigil of Rebellion. This effect can be
	//triggered once every 0.5s and can be triggered even if said character is
	//not on the field. When you possess 2 Sigils of Rebellion, all of them will
	//be consumed and all nearby party members will obtain "Millennial Movement:
	//Song of Resistance" for 12s. "Millennial Movement: Song of Resistance"
	//increases Normal, Charged and Plunging Attack DMG by 16% and increases ATK
	//by 20%. Once this effect is triggered, you will not gain Sigils of
	//Rebellion for 20s. Of the many effects of the "Millennial Movement," buffs
	//of the same type will not stack.
	w := &Weapon{}
	r := p.Refine

	//perm buff
	m := make([]float64, attributes.EndStatType)
	m[attributes.DmgP] = 0.075 + float64(r)*0.025
	char.AddStatMod("freedom-dmg", -1, attributes.NoStat, func() ([]float64, bool) {
		return m, true
	})

	atkBuff := make([]float64, attributes.EndStatType)
	atkBuff[attributes.ATKP] = .15 + float64(r)*0.05
	buffNACAPlunge := make([]float64, attributes.EndStatType)
	buffNACAPlunge[attributes.DmgP] = .12 + 0.04*float64(r)

	icd := 0
	stacks := 0
	cooldown := 0

	stackFunc := func(args ...interface{}) bool {
		atk := args[1].(*combat.AttackEvent)

		if atk.Info.ActorIndex != char.Index {
			return false
		}
		if cooldown > c.F {
			return false
		}
		if icd > c.F {
			return false
		}

		icd = c.F + 30
		stacks++
		c.Log.NewEvent("freedomsworn gained sigil", glog.LogWeaponEvent, char.Index, "sigil", stacks)

		if stacks == 2 {
			stacks = 0
			c.Status.Add("freedom", 12*60)
			cooldown = c.F + 20*60
			for _, char := range c.Player.Chars() {
				// Attack buff snapshots so it needs to be in a separate mod
				char.AddStatMod("freedom-proc", 12*60, attributes.NoStat, func() ([]float64, bool) {
					return atkBuff, true
				})
				char.AddAttackMod("freedom-proc", 12*60, func(atk *combat.AttackEvent, t combat.Target) ([]float64, bool) {
					switch atk.Info.AttackTag {
					case combat.AttackTagNormal, combat.AttackTagExtra, combat.AttackTagPlunge:
						return buffNACAPlunge, true
					}
					return nil, false
				})
			}
		}
		return false
	}

	for i := event.ReactionEventStartDelim + 1; i < event.ReactionEventEndDelim; i++ {
		c.Events.Subscribe(i, stackFunc, "freedom-"+char.Base.Key.String())
	}

	return w, nil
}