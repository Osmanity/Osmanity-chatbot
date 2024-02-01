"use client";

import logo from "@/assets/logo.png";
import AIChatButton from "@/components/BraincellFeature/AIChatButton";
import AddEditBraincellDialog from "@/components/BraincellFeature/AddEditBraincellDialog";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const { theme } = useTheme();

  const [showAddEditBraincellDialog, setShowAddEditBraincellDialog] =
    useState(false);

  return (
    <>
      <div className="border-b border-gray-200 p-4 shadow dark:border-gray-700 ">
        <div className="m-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-1">
            {/* <Image src={logo} alt="FlowBrain logo" width={40} height={40} /> */}
            <span className="text-2xl font-bold">Admin DashBoard</span>
          </Link>
          <div className="flex items-center gap-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <ThemeToggleButton />
            <Button onClick={() => setShowAddEditBraincellDialog(true)}>
              <Plus size={20} className="mr-2" />
              Add BrainCell
            </Button>
            <AIChatButton />
          </div>
        </div>
      </div>
      <AddEditBraincellDialog
        open={showAddEditBraincellDialog}
        setOpen={setShowAddEditBraincellDialog}
      />
    </>
  );
}
