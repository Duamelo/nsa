export interface IProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    initialQuantity: number;
    minThreshold: number;
    criticalThreshold: number;
    unit: string;
    stock ?: {
        quantity: number;
        minThreshold: number;
        criticalThreshold: number;
    };
}

export enum ProductModificationStatus {
    None = 0,
    Create = 1,
    Edit = 2
}