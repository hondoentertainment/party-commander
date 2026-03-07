import { useParty } from '../../state/PartyContext'
import { Card, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'

export function VenuePage() {
  const { state, dispatch } = useParty()

  const updateAmenity = (id: string, updates: Partial<(typeof state.venue.amenities)[0]>) => {
    dispatch({
      type: 'update_venue',
      payload: {
        amenities: state.venue.amenities.map((amenity) =>
          amenity.id === id ? { ...amenity, ...updates } : amenity,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Venue & Rooftop Readiness</h3>
      <p className="text-sm text-slate-300">Track amenities and propane status.</p>

      <Card>
        <CardTitle>Amenities</CardTitle>
        <div className="mt-4 space-y-4">
          {state.venue.amenities.map((amenity) => (
            <div key={amenity.id} className="rounded-xl bg-white/5 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-white">{amenity.name}</p>
                <Select
                  value={amenity.status}
                  onChange={(event) =>
                    updateAmenity(amenity.id, {
                      status: event.target.value as typeof amenity.status,
                    })
                  }
                  className="rounded-lg px-3 py-1 text-xs"
                >
                  <option value="not_checked">Not checked</option>
                  <option value="pending">Pending</option>
                  <option value="reserved">Reserved</option>
                </Select>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Input
                  value={amenity.reservationLink}
                  onChange={(event) =>
                    updateAmenity(amenity.id, { reservationLink: event.target.value })
                  }
                  className="text-xs"
                  placeholder="Reservation link"
                />
                <Input
                  value={amenity.confirmationNote}
                  onChange={(event) =>
                    updateAmenity(amenity.id, { confirmationNote: event.target.value })
                  }
                  className="text-xs"
                  placeholder="Confirmation note"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Grill Propane</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-300">
            Tank level
            <Select
              value={state.venue.propane.level}
              onChange={(event) =>
                dispatch({
                  type: 'update_venue',
                  payload: {
                    propane: { ...state.venue.propane, level: event.target.value as typeof state.venue.propane.level },
                  },
                })
              }
              className="mt-2"
            >
              <option value="full">Full</option>
              <option value="three_quarter">3/4</option>
              <option value="half">1/2</option>
              <option value="quarter">1/4</option>
              <option value="empty">Empty</option>
              <option value="unknown">Unknown</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Last checked
            <Input
              type="datetime-local"
              value={state.venue.propane.lastChecked}
              onChange={(event) =>
                dispatch({
                  type: 'update_venue',
                  payload: {
                    propane: { ...state.venue.propane, lastChecked: event.target.value },
                  },
                })
              }
              className="mt-2"
            />
          </label>
          <label className="text-sm text-slate-300">
            No-grill fallback
            <Select
              value={state.venue.propane.noGrillFallback ? 'yes' : 'no'}
              onChange={(event) =>
                dispatch({
                  type: 'update_venue',
                  payload: {
                    propane: {
                      ...state.venue.propane,
                      noGrillFallback: event.target.value === 'yes',
                    },
                  },
                })
              }
              className="mt-2"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </label>
        </div>
      </Card>
    </div>
  )
}

export default VenuePage
