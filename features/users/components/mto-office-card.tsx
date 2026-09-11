import type { OwnAccountSettings } from "../services"

export function MtoOfficeCard({
  municipality,
}: {
  municipality: OwnAccountSettings["municipality"]
}) {
  return (
    <section aria-labelledby="mto-office-heading" className="rounded-xl border bg-card p-6">
      <h2 id="mto-office-heading" className="text-lg font-semibold">
        Office Profile
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your municipal tourism office details. Managed by PTCAO — contact your administrator
        for changes.
      </p>

      {municipality == null ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No municipality linked to this account yet.
        </p>
      ) : (
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Municipality</dt>
            <dd className="mt-0.5 font-medium">{municipality.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Province</dt>
            <dd className="mt-0.5 font-medium">{municipality.province}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Status</dt>
            <dd className="mt-0.5 font-medium capitalize">{municipality.status}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Map Center</dt>
            <dd className="mt-0.5 font-medium">
              {municipality.default_map_center
                ? `${municipality.default_map_center.lat}, ${municipality.default_map_center.long}`
                : "—"}
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}
