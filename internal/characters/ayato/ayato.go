package ayato

import (
	tmpl "github.com/genshinsim/gcsim/internal/template/character"
	"github.com/genshinsim/gcsim/pkg/core"
	"github.com/genshinsim/gcsim/pkg/core/attributes"
	"github.com/genshinsim/gcsim/pkg/core/combat"
	"github.com/genshinsim/gcsim/pkg/core/glog"
	"github.com/genshinsim/gcsim/pkg/core/keys"
	"github.com/genshinsim/gcsim/pkg/core/player/character"
	"github.com/genshinsim/gcsim/pkg/core/player/weapon"
)

func init() {
	core.RegisterCharFunc(keys.Ayato, NewChar)
}

type char struct {
	*tmpl.Character
	stacks            int
	stacksMax         int
	shunsuikenCounter int
	particleICD       int
	a4ICD             int
	c6ready           bool
}

func NewChar(s *core.Core, w *character.CharWrapper, p character.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.Base.Element = attributes.Hydro
	c.EnergyMax = 80
	c.Weapon.Class = weapon.WeaponClassSword
	c.CharZone = character.ZoneInazuma
	c.BurstCon = 3
	c.SkillCon = 5
	c.NormalHitNum = normalHitNum

	c.shunsuikenCounter = 3
	c.particleICD = 0
	c.a4ICD = 0
	c.c6ready = false

	c.stacksMax = 4
	if c.Base.Cons >= 2 {
		c.stacksMax = 5
	}

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a1()
	c.a4()
	c.onExitField()
	if c.Base.Cons >= 1 {
		c.c1()
	}
	if c.Base.Cons >= 2 {
		c.c2()
	}
	if c.Base.Cons >= 6 {
		c.c6()
	}
	return nil
}

func (c *char) AdvanceNormalIndex() {
	c.NormalCounter++

	if c.Core.Status.Duration("soukaikanka") > 0 {
		if c.NormalCounter == c.shunsuikenCounter {
			c.NormalCounter = 0
		}
	} else {
		if c.NormalCounter == c.NormalHitNum {
			c.NormalCounter = 0
		}

	}
}

// TODO: maybe move infusion out of snapshot?
func (c *char) Snapshot(ai *combat.AttackInfo) combat.Snapshot {
	ds := c.Character.Snapshot(ai)

	if c.Core.Status.Duration("soukaikanka") > 0 {
		switch ai.AttackTag {
		case combat.AttackTagNormal:
		case combat.AttackTagExtra:
		default:
			return ds
		}
		ai.Element = attributes.Hydro
		//add namisen stack
		flatdmg := (c.Base.HP*(1+ds.Stats[attributes.HPP]) + ds.Stats[attributes.HP]) * skillpp[c.TalentLvlSkill()] * float64(c.stacks)
		ai.FlatDmg += flatdmg
		c.Core.Log.NewEvent("namisen add damage", glog.LogCharacterEvent, c.Index, "damage_added", flatdmg, "stacks", c.stacks, "expiry", c.Core.Status.Duration("soukaikanka"))
	}
	return ds
}