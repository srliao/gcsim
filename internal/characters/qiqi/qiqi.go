package qiqi

import (
	tmpl "github.com/genshinsim/gcsim/internal/template/character"
	"github.com/genshinsim/gcsim/pkg/core"
	"github.com/genshinsim/gcsim/pkg/core/attributes"
	"github.com/genshinsim/gcsim/pkg/core/combat"
	"github.com/genshinsim/gcsim/pkg/core/keys"
	"github.com/genshinsim/gcsim/pkg/core/player/character"
	"github.com/genshinsim/gcsim/pkg/core/player/weapon"
)

const (
	talismanKey    = "qiqi-talisman"
	talismanICDKey = "qiqi-talisman-icd"
)

func init() {
	core.RegisterCharFunc(keys.Qiqi, NewChar)
}

type char struct {
	*tmpl.Character
	c4ICDExpiry       int
	skillLastUsed     int
	skillHealSnapshot combat.Snapshot // Required as both on hit procs and continuous healing need to use this
}

// TODO: Not implemented - C6 (revival mechanic, not suitable for sim)
// C4 - Enemy Atk reduction, not useful in this sim version
func NewChar(s *core.Core, w *character.CharWrapper, p character.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.Base.Element = attributes.Cryo
	c.EnergyMax = 80
	c.Weapon.Class = weapon.WeaponClassSword
	c.NormalHitNum = normalHitNum
	c.BurstCon = 3
	c.SkillCon = 5
	c.CharZone = character.ZoneLiyue

	c.skillLastUsed = 0

	w.Character = &c

	return nil
}

// Ensures the set of targets are initialized properly
func (c *char) Init() error {
	c.a1()
	c.talismanHealHook()
	c.onNACAHitHook()
	if c.Base.Cons >= 2 {
		c.c2()
	}
	return nil
}

// Helper function to calculate healing amount dynamically using current character stats, which has all mods applied
func (c *char) healDynamic(healScalePer []float64, healScaleFlat []float64, talentLevel int) float64 {
	atk := c.Base.Atk + c.Weapon.Atk*(1+c.Stat(attributes.ATKP)) + c.Stat(attributes.ATK)
	heal := healScaleFlat[talentLevel] + atk*healScalePer[talentLevel]
	return heal
}

// Helper function to calculate healing amount from a snapshot instance
func (c *char) healSnapshot(d *combat.Snapshot, healScalePer []float64, healScaleFlat []float64, talentLevel int) float64 {
	atk := d.BaseAtk*(1+d.Stats[attributes.ATKP]) + d.Stats[attributes.ATK]
	heal := healScaleFlat[talentLevel] + atk*healScalePer[talentLevel]
	return heal
}