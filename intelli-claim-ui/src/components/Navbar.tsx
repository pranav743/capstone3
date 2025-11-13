"use client";

import useIsDesktop from "@/hooks/useIsDesktop";
import {
  Avatar,
  Button,
  Caption,
  CollapsibleSidebar,
  Drawer,
  DrawerContent,
  Header,
  NavLink,
  ScrollArea,
  Text,
  colors,
} from "@hdfclife-insurance/one-x-ui";
import {
  Copy,
  Gear,
  Handshake,
  House,
  Layout,
  Power,
  ShieldCheck,
  TrendUp,
  UserGear,
  Users,
} from "@phosphor-icons/react";
import { RankingInfo } from "@tanstack/match-sorter-utils";
import {
  FilterFn
} from "@tanstack/react-table";
import clsx from "clsx";
import Head from "next/head";
import React, { useCallback, useState } from "react";
import HLIInspireLogo from "@public/HLI_Inspire_Logo.acc056fd.png";

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export default function Navbar({children}: {children: React.ReactNode}) {
  const isDesktop = useIsDesktop();

  const [open, setOpen] = useState({
    leftSection: false,
    rightSection: false,
  });

  const handlePressedChange = useCallback((pressed: boolean) => {
    setOpen((prev) => ({ ...prev, leftSection: pressed }));
  }, []);

  return (
    // custom properties for the layout
    <div className="min-h-dvh flex flex-col bg-gray-100 [--left-sidebar-width:240px] [--right-sidebar-width:60px] [--gutter:24px] [--header-height:68px]">
      <Head>
        <title>Dashboard with Data grid</title>
      </Head>
      <Header
        fixed
        className="border-0 border-b border-solid border-indigo-200"
      >
        <Header.Hamburger
          pressed={open.leftSection}
          onPressedChange={handlePressedChange}
        />
        <Header.Logo src={HLIInspireLogo.src} className="!w-[150px]" />
        <div className="flex items-center justify-end gap-3 w-full">
          <div className="text-right hidden lg:block">
            <Text size="sm" fontWeight="bold">
              Sujoy Guru
            </Text>
            <Text size="sm">Key Account Manager</Text>
            <Caption className="italic">
              Last login : 03/09/2024 12:21 pm
            </Caption>
          </div>
          <Avatar
            variant="outline"
            src="https://helixassets.apps-hdfclife.com/images/Childcare_2.png"
          />
        </div>
      </Header>
      <div className="lg:flex flex-1">
        {/* Left Sidebar Desktop */}
        <aside
          style={
            {
              "--left-sidebar-width": open.leftSection ? "240px" : "78px",
            } as React.CSSProperties
          }
          className="hidden lg:flex flex-col fixed transition-all duration-300 ease-in-out bottom-0 top-0 pt-[var(--header-height)] left-0 "
        >
          <CollapsibleSidebar
            collapsed={!open.leftSection}
            items={[
              {
                label: "Dashboard",
                href: "#",
                leftSection: <House />,
              },
              {
                label: "New business",
                href: "#",
                active: true,
                leftSection: <Users color={colors["brand-red"]} />,
              },
              {
                label: "Claims",
                href: "#",
                leftSection: <ShieldCheck />,
              },
              {
                label: "Services",
                href: "#",
                leftSection: <Layout />,
              },
              {
                label: "Prospects",
                href: "#",
                leftSection: <UserGear />,
              },
              {
                label: "Partner",
                href: "#",
                leftSection: <Handshake />,
              },
              {
                label: "Loaders",
                href: "#",
                leftSection: <Copy />,
              },
              {
                label: "Reports",
                href: "#",
                leftSection: <TrendUp />,
              },
              {
                label: "Settings",
                href: "#",
                leftSection: <Gear />,
              },
            ]}
          />
        </aside>
        {/* Left Sidebar Mobile */}
        {!isDesktop && (
          <Drawer
            open={open.leftSection}
            onClose={() => setOpen((prev) => ({ ...prev, leftSection: false }))}
            direction="left"
          >
            <DrawerContent className="w-[250px] px-3">
              <ScrollArea className="flex-1 h-0">
                <div className="space-y-1">
                  <NavLink href="#" label="Dashboard" leftSection={<House />} />
                  <NavLink
                    href="#"
                    label="New business"
                    leftSection={<Users />}
                  />
                  <NavLink
                    href="#"
                    label="Claims"
                    leftSection={<ShieldCheck />}
                  />
                  <NavLink href="#" label="Services" leftSection={<Layout />} />
                  <NavLink
                    href="#"
                    label="Prospects"
                    leftSection={<UserGear />}
                  />
                  <NavLink
                    href="#"
                    label="Partner"
                    leftSection={<Handshake />}
                  />
                  <NavLink href="#" label="Loaders" leftSection={<Copy />} />
                  <NavLink href="#" label="Reports" leftSection={<TrendUp />} />
                  <NavLink href="#" label="Settings" leftSection={<Gear />} />
                </div>
              </ScrollArea>
              <Button variant="tertiary" size="sm" startIcon={<Power />}>
                Logout
              </Button>
            </DrawerContent>
          </Drawer>
        )}
        {/* Main  */}
        <main
          style={
            {
              "--left-sidebar-width": open.leftSection ? "240px" : "76px",
            } as React.CSSProperties
          }
          className={clsx(
            "flex-1 px-4 lg:px-0 pb-[var(--gutter)] pt-[calc(var(--header-height)+var(--gutter))] lg:pl-[calc(var(--gutter)+var(--left-sidebar-width))] lg:pr-[calc(var(--right-sidebar-width)+var(--gutter))] duration-300 ease-in-out transition-[padding] overflow-x-hidden",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}