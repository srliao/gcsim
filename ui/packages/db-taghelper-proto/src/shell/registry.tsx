import type { db } from "@gcsim/types";
import type { JSX } from "react";
import { DatabaseAltA } from "../surfaces/db/Database/AltA";
import { DatabaseAltB } from "../surfaces/db/Database/AltB";
import { DatabaseAltC } from "../surfaces/db/Database/AltC";
import { DbHome } from "../surfaces/db/Home/Home";
import { TagHelperAltA } from "../surfaces/taghelper/AltA";
import { TagHelperAltB } from "../surfaces/taghelper/AltB";
import { TagHelperAltC } from "../surfaces/taghelper/AltC";

export type Viewport = "desktop" | "mobile";

export type SurfaceProps = {
	entries: db.Entry[];
	viewport: Viewport;
	onBrowse?: () => void;
};

export type Alternative = {
	id: string;
	label: string;
	blurb: string;
	Component: (props: SurfaceProps) => JSX.Element;
};

export type Surface = {
	id: string;
	label: string;
	blurb: string;
	alternatives: Alternative[];
};

export const SURFACES: Surface[] = [
	{
		id: "db-home",
		label: "DB · Home",
		blurb: "Landing page — welcome, collections legend, latest release.",
		alternatives: [
			{
				id: "home",
				label: "Proposed",
				blurb: "Compact hero + collection cards + release highlight.",
				Component: DbHome,
			},
		],
	},
	{
		id: "db-database",
		label: "DB · Database",
		blurb: "The core browse screen — filter, search, sort, list of sims.",
		alternatives: [
			{
				id: "a",
				label: "A · Command bar",
				blurb: "Sticky command bar over one column of full detail cards.",
				Component: DatabaseAltA,
			},
			{
				id: "b",
				label: "B · Rail + grid",
				blurb: "Persistent filter rail beside a responsive card grid.",
				Component: DatabaseAltB,
			},
			{
				id: "c",
				label: "C · Dense rows",
				blurb: "Quick tag chips over horizontal power-user rows.",
				Component: DatabaseAltC,
			},
		],
	},
	{
		id: "taghelper",
		label: "TagHelper",
		blurb:
			"Moderator triage — approve/reject a submission, dedup vs same-team sims.",
		alternatives: [
			{
				id: "a",
				label: "A · Stacked",
				blurb: "Review card on top, duplicates listed below.",
				Component: TagHelperAltA,
			},
			{
				id: "b",
				label: "B · Split compare",
				blurb: "Submission pinned left, duplicates scroll on the right.",
				Component: TagHelperAltB,
			},
			{
				id: "c",
				label: "C · Toolbar + table",
				blurb: "Sticky decision toolbar with a comparison table.",
				Component: TagHelperAltC,
			},
		],
	},
];
