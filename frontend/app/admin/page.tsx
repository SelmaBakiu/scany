import { redirect } from "next/navigation";

/** /admin has no dashboard of its own; Retter is where the work is. */
export default function AdminIndex() {
  redirect("/admin/items");
}
