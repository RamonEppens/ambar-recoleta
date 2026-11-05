import { redirect } from "next/navigation";

/** La portada del admin es la carta: lo que más se edita. */
export default function AdminPage() {
  redirect("/admin/platos");
}
