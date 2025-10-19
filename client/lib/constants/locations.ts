export interface Location {
  id: string;
  name: string;
  area: string;
  deliveryFee: number;
}

export const DELIVERY_LOCATIONS: Location[] = [
  { id: '1', name: 'Kakamega Town Center', area: 'CBD', deliveryFee: 0 },
  { id: '2', name: 'Amalemba', area: 'Residential', deliveryFee: 150 },
  { id: '3', name: 'Shirere', area: 'Residential', deliveryFee: 200 },
  { id: '4', name: 'Maraba', area: 'Residential', deliveryFee: 180 },
  { id: '5', name: 'Mahiakalo', area: 'Residential', deliveryFee: 250 },
  { id: '6', name: 'Mumias Road', area: 'Highway', deliveryFee: 300 },
  { id: '7', name: 'Bukhungu Stadium Area', area: 'Sports Complex', deliveryFee: 100 },
  { id: '8', name: 'Milimani Estate', area: 'Residential', deliveryFee: 220 },
  { id: '9', name: 'Shikusa', area: 'Outskirts', deliveryFee: 350 },
  { id: '10', name: 'Matungu', area: 'Outskirts', deliveryFee: 400 },
];

export const getLocationById = (id: string): Location | undefined => {
  return DELIVERY_LOCATIONS.find((loc) => loc.id === id);
};
