package eula

import (
	tmpl "github.com/genshinsim/gcsim/internal/template/character"
	"github.com/genshinsim/gcsim/pkg/core"
	"github.com/genshinsim/gcsim/pkg/core/attributes"
	"github.com/genshinsim/gcsim/pkg/core/keys"
	"github.com/genshinsim/gcsim/pkg/core/player/character"
	"github.com/genshinsim/gcsim/pkg/core/player/weapon"
)

func init() {
	core.RegisterCharFunc(keys.Eula, NewChar)
}

type char struct {
	*tmpl.Character
	grimheartReset  int
	burstCounter    int
	burstCounterICD int
	grimheartICD    int
}

func NewChar(s *core.Core, w *character.CharWrapper, p character.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.Base.Element = attributes.Cryo
	c.EnergyMax = 80
	c.Weapon.Class = weapon.WeaponClassClaymore
	c.NormalHitNum = normalHitNum
	c.BurstCon = 3
	c.SkillCon = 5

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a4()
	c.burstStacks()
	c.onExitField()
	if c.Base.Cons >= 4 {
		c.c4()
	}
	return nil
}

func (c *char) Tick() {
	c.Character.Tick()
	c.grimheartReset--
	if c.grimheartReset == 0 {
		c.Tags["grimheart"] = 0
	}
}