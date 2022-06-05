package gorou

import (
	"github.com/genshinsim/gcsim/internal/frames"
	tmpl "github.com/genshinsim/gcsim/internal/template/character"
	"github.com/genshinsim/gcsim/pkg/core"
	"github.com/genshinsim/gcsim/pkg/core/attributes"
	"github.com/genshinsim/gcsim/pkg/core/keys"
	"github.com/genshinsim/gcsim/pkg/core/player/character"
	"github.com/genshinsim/gcsim/pkg/core/player/weapon"
)

const (
	normalHitNum             = 4
	defenseBuffKey           = "goroubuff"
	generalWarBannerKey      = "generalwarbanner"
	generalGloryKey          = "generalglory"
	generalWarBannerDuration = 600    //10s
	generalGloryDuration     = 9 * 60 //9 s
	heedlessKey              = "headlessbuff"
	c6key                    = "gorou-c6"
)

func init() {
	initCancelFrames()
	core.RegisterCharFunc(keys.Gorou, NewChar)
}

type char struct {
	*tmpl.Character
	eFieldSrc     int
	eFieldHealSrc int
	qFieldSrc     int
	gorouBuff     []float64
	geoCharCount  int
	c2Extension   int
	c6buff        []float64
}

func NewChar(s *core.Core, w *character.CharWrapper, p character.CharacterProfile) error {
	c := char{}
	t := tmpl.New(s)
	t.CharWrapper = w
	c.Character = t

	c.Base.Element = attributes.Geo

	e, ok := p.Params["start_energy"]
	if !ok {
		e = 80
	}
	c.Energy = float64(e)
	c.EnergyMax = 80
	c.Weapon.Class = weapon.WeaponClassBow
	c.NormalHitNum = normalHitNum
	c.BurstCon = 5
	c.SkillCon = 3
	c.CharZone = character.ZoneInazuma

	c.c6buff = make([]float64, attributes.EndStatType)
	c.gorouBuff = make([]float64, attributes.EndStatType)

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	for _, char := range c.Core.Player.Chars() {
		if char.Base.Element == attributes.Geo {
			c.geoCharCount++
		}
	}

	/**
	Provides up to 3 buffs to active characters within the skill's AoE based on the number of Geo characters in the party at the time of casting:
	• 1 Geo character: Adds "Standing Firm" - DEF Bonus.
	• 2 Geo characters: Adds "Impregnable" - Increased resistance to interruption.
	• 3 Geo characters: Adds "Crunch" - Geo DMG Bonus.
	**/
	c.gorouBuff[attributes.DEF] = skillDefBonus[c.TalentLvlSkill()]
	if c.geoCharCount > 2 {
		c.gorouBuff[attributes.GeoP] = 0.15 // 15% geo damage
	}

	/**
	For 12s after using Inuzaka All-Round Defense or Juuga: Forward Unto Victory, increases the CRIT DMG of all nearby party members' Geo DMG based on the buff level of the skill's field at the time of use:
	• "Standing Firm": +10%
	• "Impregnable": +20%
	• "Crunch": +40%
	This effect cannot stack and will take reference from the last instance of the effect that is triggered.
	**/
	switch c.geoCharCount {
	case 1:
		c.c6buff[attributes.CD] = 0.1
	case 2:
		c.c6buff[attributes.CD] = 0.2
	default:
		//can't be less than 1 so this is 3 or 4
		c.c6buff[attributes.CD] = 0.4
	}

	if c.Base.Cons > 0 {
		c.c1()
	}
	if c.Base.Cons >= 2 {
		c.c2()
	}

	return nil
}

func initCancelFrames() {
	// NA cancels
	attackFrames = make([][]int, normalHitNum)

	attackFrames[0] = frames.InitNormalCancelSlice(attackHitmarks[0], 15)
	attackFrames[1] = frames.InitNormalCancelSlice(attackHitmarks[1], 18)
	attackFrames[2] = frames.InitNormalCancelSlice(attackHitmarks[2], 39)
	attackFrames[3] = frames.InitNormalCancelSlice(attackHitmarks[3], 41)

	// aimed -> x
	aimedFrames = frames.InitAbilSlice(94)

	// skill -> x
	skillFrames = frames.InitAbilSlice(35)

	// burst -> x
	burstFrames = frames.InitAbilSlice(74)
}
