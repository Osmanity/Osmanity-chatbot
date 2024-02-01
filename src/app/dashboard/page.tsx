import BraincellsCard from "@/components/BraincellFeature/BraincellsCard";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import { Braincell as BraincellModel } from "@prisma/client";

export const metadata: Metadata = {
  title: "Osmanity - Admin Dashboard",
};

// Define an interface for Braincell
interface Braincell {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async function BraincellsPage() {
  const { userId } = auth();

  if (!userId) throw Error("userId undefined");

  const allBraincells = await prisma.braincell.findMany({ where: { userId } });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="col-span-full pt-8 text-center text-5xl font-bold tracking-tight sm:text-6xl  ">
        {"Your Virtual Assistance Brain"}
      </div>
      <div className="col-span-full pb-12 text-center text-xl font-bold tracking-tight opacity-60 sm:text-xl ">
        {
          "Make Your Virtual Assistant More Intelligent with Your Custom BrainCells"
        }
      </div>
      {allBraincells.map((Braincell: BraincellModel) => (
        <BraincellsCard Braincell={Braincell} key={Braincell.id} />
      ))}
      {allBraincells.length === 0 && (
        <div className="col-span-full text-center">
          You don&apos;t have any braincells yet.
          <br />
          Why don&apos;t you create one to train your virtual assistant?
          <br />
          {/* When you add braincells, you can edit and change the content to
          customize your virtual assistant. */}
        </div>
      )}
    </div>
  );
}
