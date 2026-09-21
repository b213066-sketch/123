"use server"

import { revalidatePath, revalidateTag } from "next/cache"

export async function refreshSchedule() {
  revalidateTag("schedule", { expire: 0 })
  revalidatePath("/")
}
