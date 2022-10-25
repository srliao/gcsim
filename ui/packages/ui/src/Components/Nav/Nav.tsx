import React from "react";
import {
  Alignment,
  AnchorButton,
  Classes,
  HTMLSelect,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core";
import { Link, useLocation } from "wouter";
import { Trans, useTranslation } from "react-i18next";
import { RootState, useAppSelector } from "../../Stores/store";
import logoUrl from "../Images/logo.png";

export function Nav() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const { user } = useAppSelector((state: RootState) => {
    return {
      user: state.user,
    };
  });

  const [location] = useLocation();
  return (
    <Navbar className="overflow-x-clip">
      <NavbarGroup align={Alignment.LEFT} className="w-full">
        <img
          src={logoUrl}
          className=" object-contain max-h-[75%] mt-auto mb-auto mr-1"
        />
        <Link href="/">
          <NavbarHeading>
            <a>gcsim (beta)</a>
          </NavbarHeading>
        </Link>
        {location !== "/" ? (
          <>
            <NavbarDivider />
            <Link href="/simulator">
              <AnchorButton className={Classes.MINIMAL} icon="calculator">
                <span className="hidden md:block">
                  <Trans>nav.simulator</Trans>
                </span>
              </AnchorButton>
            </Link>
            <Link href="/viewer">
              <AnchorButton className={Classes.MINIMAL} icon="chart">
                <span className="hidden md:block">
                  <Trans>nav.viewer</Trans>
                </span>
              </AnchorButton>
            </Link>
            <AnchorButton
                className={Classes.MINIMAL}
                icon="database"
                href="https://db.gcsim.app"
                target={"_blank"}>
              <span className="hidden md:block">
                <Trans>nav.teams_db</Trans>
              </span>
            </AnchorButton>
            <Link href="/about">
              <AnchorButton className={Classes.MINIMAL} icon="info-sign">
                <span className="hidden md:block">
                  <Trans>nav.about</Trans>
                </span>
              </AnchorButton>
            </Link>
          </>
        ) : null}
        <div className="ml-auto">
          <Link href="/account">
            <AnchorButton className={Classes.MINIMAL} icon="user">
              {user.user_name}
            </AnchorButton>
          </Link>
        </div>
        <div className="flex flex-row items-center ml-2">
          <HTMLSelect
            className="ml-2"
            value={language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value);
            }}
          >
            <option value="en">{t<string>("nav.english")}</option>
            <option value="zh">{t<string>("nav.chinese")}</option>
            <option value="de">{t<string>("nav.german")}</option>
            <option value="ja">{t<string>("nav.japanese")}</option>
            <option value="es">{t<string>("nav.spanish")}</option>
            <option value="ru">{t<string>("nav.russian")}</option>
          </HTMLSelect>
        </div>
      </NavbarGroup>
    </Navbar>
  );
}