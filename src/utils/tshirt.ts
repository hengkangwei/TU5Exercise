const DEFAULT_DARKEN_FACTOR = 0.3;

export interface TShirtProperties {
  id: string;
  color: string;
  title: string;
}

export const TSHIRT_COLLECTION: TShirtProperties[] = [
  { id: "550e8400-e29b-41d4-a716-446655440001", color: "#f8f8ff", title: "Ghost White" },
  { id: "550e8400-e29b-41d4-a716-446655440002", color: "#e6e6fa", title: "Lavender" },
  { id: "550e8400-e29b-41d4-a716-446655440003", color: "#ffefd5", title: "Papaya Whip" },
  { id: "550e8400-e29b-41d4-a716-446655440004", color: "#ffb6c1", title: "Light Pink" },
  { id: "550e8400-e29b-41d4-a716-446655440005", color: "#dda0dd", title: "Plum" },
  { id: "550e8400-e29b-41d4-a716-446655440006", color: "#d3d3d3", title: "Light Gray" },
  { id: "550e8400-e29b-41d4-a716-446655440007", color: "#e0e0e0", title: "Platinum" },
  { id: "550e8400-e29b-41d4-a716-446655440008", color: "#c8f7c5", title: "Mint Green" },
  { id: "550e8400-e29b-41d4-a716-446655440009", color: "#ffd1dc", title: "Rose" },
  { id: "550e8400-e29b-41d4-a716-446655440010", color: "#b0e0e6", title: "Powder Blue" },
  { id: "550e8400-e29b-41d4-a716-446655440011", color: "#f5deb3", title: "Wheat" },
  { id: "550e8400-e29b-41d4-a716-446655440012", color: "#d8bfd8", title: "Thistle" },
  { id: "550e8400-e29b-41d4-a716-446655440013", color: "#dcd0ff", title: "Periwinkle" },
  { id: "550e8400-e29b-41d4-a716-446655440014", color: "#afeeee", title: "Pale Turquoise" },
  { id: "550e8400-e29b-41d4-a716-446655440015", color: "#ffe4b5", title: "Moccasin" },
  { id: "550e8400-e29b-41d4-a716-446655440016", color: "#da70d6", title: "Orchid" },
  { id: "550e8400-e29b-41d4-a716-446655440017", color: "#98fb98", title: "Pale Green" },
  { id: "550e8400-e29b-41d4-a716-446655440018", color: "#87ceeb", title: "Sky Blue" },
  { id: "550e8400-e29b-41d4-a716-446655440019", color: "#f0e68c", title: "Khaki" },
  { id: "550e8400-e29b-41d4-a716-446655440020", color: "#20b2aa", title: "Light Sea Green" },
  { id: "550e8400-e29b-41d4-a716-446655440021", color: "#f4a460", title: "Sandy Brown" },
  { id: "550e8400-e29b-41d4-a716-446655440022", color: "#ffc0cb", title: "Pink" },
  { id: "550e8400-e29b-41d4-a716-446655440023", color: "#add8e6", title: "Light Blue" },
  { id: "550e8400-e29b-41d4-a716-446655440024", color: "#ffcccb", title: "Light Coral" },
  { id: "550e8400-e29b-41d4-a716-446655440025", color: "#fffacd", title: "Lemon Chiffon" },
  { id: "550e8400-e29b-41d4-a716-446655440026", color: "#deb887", title: "Burlywood" },
  { id: "550e8400-e29b-41d4-a716-446655440027", color: "#f5f5dc", title: "Beige" },
  { id: "550e8400-e29b-41d4-a716-446655440028", color: "#ffffff", title: "Pure White" },
];

// Augment the base collection with random size and price at module load.
const SIZES = ["S", "M", "L", "XL"] as const;

function getRandomSize(): typeof SIZES[number] {
  const idx = Math.floor(Math.random() * SIZES.length);
  return SIZES[idx];
}

function getRandomPrice(min = 10, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const TSHIRT_COLLECTION_AUGMENTED = TSHIRT_COLLECTION.map((t) => ({
  ...t,
  size: getRandomSize(),
  price: getRandomPrice(),
}));

function darkenColor(
  color: { r: number; g: number; b: number },
  factor: number,
): string {
  const r = Math.floor(color.r * (1 - factor));
  const g = Math.floor(color.g * (1 - factor));
  const b = Math.floor(color.b * (1 - factor));
  return `rgb(${r}, ${g}, ${b})`;
}

export function renderTShirt(canvas: HTMLCanvasElement, color: string): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const scale = 1.5;
  const bodyWidth = 35 * scale;
  const bodyHeight = 60 * scale;
  const neckRadius = 8 * scale;
  const sleeveWidth = 16 * scale;
  const sleeveHeight = 18 * scale;

  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const color1 = color;
  const color2 = darkenColor({ r, g, b }, DEFAULT_DARKEN_FACTOR);

  const bodyLeft = centerX - bodyWidth / 2;
  const bodyRight = centerX + bodyWidth / 2;
  const bodyTop = centerY - bodyHeight / 2;
  const bodyBottom = centerY + bodyHeight / 2;
  const shoulderY = bodyTop + 5 * scale;

  const gradient = ctx.createLinearGradient(
    centerX,
    bodyTop,
    centerX,
    bodyBottom,
  );
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  ctx.beginPath();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.fillStyle = gradient;

  ctx.moveTo(bodyLeft, shoulderY);
  ctx.lineTo(bodyLeft - sleeveWidth, shoulderY);
  ctx.lineTo(bodyLeft - sleeveWidth + 3 * scale, shoulderY + sleeveHeight);
  ctx.lineTo(bodyLeft, shoulderY + sleeveHeight);
  ctx.lineTo(bodyLeft, bodyBottom);
  ctx.lineTo(bodyRight, bodyBottom);
  ctx.lineTo(bodyRight, shoulderY + sleeveHeight);
  ctx.lineTo(bodyRight + sleeveWidth - 3 * scale, shoulderY + sleeveHeight);
  ctx.lineTo(bodyRight + sleeveWidth, shoulderY);
  ctx.lineTo(bodyRight, shoulderY);
  ctx.lineTo(centerX + neckRadius, shoulderY);
  ctx.arc(centerX, shoulderY, neckRadius, 0, Math.PI, false);
  ctx.lineTo(bodyLeft, shoulderY);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
