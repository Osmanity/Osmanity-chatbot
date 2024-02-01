"use client";

import { Braincell as BraincellModel } from "@prisma/client";
import { useState } from "react";
import AddEditBraincellDialog from "./AddEditBraincellDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface BraincellProps {
  Braincell: BraincellModel;
}

export default function BraincellsCard({ Braincell }: BraincellProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const wasUpdated = Braincell.updatedAt > Braincell.createdAt;

  const createdUpdatedAtTimestamp = (
    wasUpdated ? Braincell.updatedAt : Braincell.createdAt
  ).toDateString();

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-lg"
        onClick={() => setShowEditDialog(true)}
      >
        <CardHeader>
          <CardTitle>{Braincell.title}</CardTitle>
          <CardDescription>
            {createdUpdatedAtTimestamp}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{Braincell.content}</p>
        </CardContent>
      </Card>
      <AddEditBraincellDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        braincellToEdit={Braincell}
      />
    </>
  );
}
