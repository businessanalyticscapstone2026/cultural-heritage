import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getProfileAction } from "@/features/profile/actions"
import ProfileClient from "@/features/profile/components/profile-client"

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const profile = await getProfileAction(user.id)

  return (
    <ProfileClient userId={user.id} profile={profile} />
  )
}
