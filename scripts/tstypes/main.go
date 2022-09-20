// this package generates all the ts typings sourced from sim
package main

import (
	"log"
	"os"
	"text/template"

	"github.com/genshinsim/gcsim/pkg/core/attributes"
	"github.com/genshinsim/gcsim/pkg/core/curves"
	"github.com/genshinsim/gcsim/pkg/core/keys"
)

var fns = template.FuncMap{
	"plus1": func(x int) int {
		return x + 1
	},
}

type chardetail struct {
	Key     string
	Element string
	Weapon  string
}
type data struct {
	Stats           []string
	Elements        []string
	CharacterKey    []string
	WeaponKey       []string
	SetKey          []string
	CharacterDetail []chardetail
}

var tmplStr = `export type StatKey =
  {{$n := len .Stats}}{{range $i, $v := .Stats -}}
  | '{{$v}}'{{if (eq (plus1 $i) $n)}};{{end}}
  {{end}}

export type Element =
  {{$n := len .Elements}}{{range $i, $v := .Elements -}}
  | '{{$v}}'{{if (eq (plus1 $i) $n)}};{{end}}
  {{end}}

export type CharacterKey =
  {{$n := len .CharacterKey}}{{range $i, $v := .CharacterKey -}}
  | '{{$v}}'{{if (eq (plus1 $i) $n)}};{{end}}
  {{end}}

export type ArtifactKey =
  {{$n := len .SetKey}}{{range $i, $v := .SetKey -}}
  | '{{$v}}'{{if (eq (plus1 $i) $n)}};{{end}}
  {{end}}

export type WeaponKey =
  {{$n := len .WeaponKey}}{{range $i, $v := .WeaponKey -}}
  | '{{$v}}'{{if (eq (plus1 $i) $n)}};{{end}}
  {{end}}

export interface CharacterDetail {
  element: Element;
  weapon_type: string;
}

export const characters : {
  [key in CharacterKey] : CharacterDetail
} = {
  {{range $i, $v := .CharacterDetail -}}
  {{$v.Key}} : {
    element: '{{$v.Element}}',
    weapon_type: '{{$v.Weapon}}',
  },
  {{end}}
}
`

func main() {
	var d data

	for i := attributes.NoStat; i <= attributes.PhyP; i++ {
		d.Stats = append(d.Stats, i.String())
	}

	for i := keys.NoChar + 1; i < keys.TestCharDoNotUse-1; i++ {
		//some are skips
		switch i {
		case keys.Aether, keys.Lumine, keys.TravelerDelim:
			continue
		}
		d.CharacterKey = append(d.CharacterKey, i.String())
		d.CharacterDetail = append(d.CharacterDetail, chardetail{
			Key:     i.String(),
			Element: curves.CharBaseMap[i].Element.String(),
			Weapon:  curves.CharBaseMap[i].WeaponType.String(),
		})
	}

	for i := keys.NoWeapon + 1; i < keys.EndWeaponKeys-1; i++ {
		d.WeaponKey = append(d.WeaponKey, i.String())
	}

	for i := keys.NoSet + 1; i < keys.EndSetKeys-1; i++ {
		d.SetKey = append(d.SetKey, i.String())
	}

	for i := attributes.Electro; i < attributes.UnknownElement; i++ {
		if i == attributes.NoElement {
			continue
		}
		d.Elements = append(d.Elements, i.String())
	}

	writeTmpl(tmplStr, "./gcsim.ts", d)

}

func writeTmpl(tmplStr string, outFile string, d data) {
	t, err := template.New("out").Funcs(fns).Parse(tmplStr)
	if err != nil {
		log.Panic(err)
	}
	os.Remove(outFile)
	of, err := os.Create(outFile)
	if err != nil {
		log.Panic(err)
	}
	err = t.Execute(of, d)
	if err != nil {
		log.Panic(err)
	}
}
