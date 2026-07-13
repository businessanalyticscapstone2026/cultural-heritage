"use server"

import { getHeritageSites } from "../services"

export async function getHeritageSitesAction() {
  return getHeritageSites()
}
