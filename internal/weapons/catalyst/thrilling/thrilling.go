package thrilling

import (
	"fmt"

	"github.com/genshinsim/gcsim/pkg/core"
	"github.com/genshinsim/gcsim/pkg/core/attributes"
	"github.com/genshinsim/gcsim/pkg/core/event"
	"github.com/genshinsim/gcsim/pkg/core/glog"
	"github.com/genshinsim/gcsim/pkg/core/keys"
	"github.com/genshinsim/gcsim/pkg/core/player/character"
	"github.com/genshinsim/gcsim/pkg/core/player/weapon"
)

func init() {
	core.RegisterWeaponFunc(keys.ThrillingTalesOfDragonSlayers, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

func NewWeapon(c *core.Core, char *character.CharWrapper, p weapon.WeaponProfile) (weapon.Weapon, error) {
	//When switching characters, the new character taking the field has their
	//ATK increased by 24% for 10s. This effect can only occur once every 20s.
	w := &Weapon{}
	r := p.Refine

	cd := -1
	isActive := false
	key := fmt.Sprintf("thrilling-%v", char.Base.Key.String())

	c.Events.Subscribe(event.OnInitialize, func(args ...interface{}) bool {
		isActive = c.Player.Active() == char.Index
		return true
	}, key)

	m := make([]float64, attributes.EndStatType)
	m[attributes.ATKP] = .18 + float64(r)*0.06

	c.Events.Subscribe(event.OnCharacterSwap, func(args ...interface{}) bool {
		if !isActive && c.Player.Active() == char.Index {
			isActive = true
			return false
		}

		if isActive && c.Player.Active() != char.Index {
			isActive = false
			if c.F < cd {
				return false
			}

			cd = c.F + 60*20
			active := c.Player.ActiveChar()
			active.AddStatMod("thrilling tales", 600, attributes.NoStat, func() ([]float64, bool) {
				return m, true
			})

			c.Log.NewEvent("ttds activated", glog.LogWeaponEvent, c.Player.Active(), "expiry", c.F+600)
		}

		return false
	}, key)

	return w, nil
}