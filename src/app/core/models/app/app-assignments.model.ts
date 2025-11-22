import { ApiAssignment } from '../api/api-assignments.model';

export interface AssignmentFilter {
    portIds?: string[] | null;
    tourIds?: string[] | null;
    driverId?: number | null;
    dockId?: number | null;
    shipCompanyId?: number | null;
    shipId?: number | null;
    sortDirection?: 'ASC' | 'DESC';
    currentDateTime?: string | null;
}

export interface AppAssignment {
    companyName: string;
    tourId: number;
    tourInventoryId: number;
    tourInventoryTime: string;
    tourInventoryAllocatedSeats: number;
    tourTime: string;
    duration: string;
    shipName: string;
    tourName: string;
    tourShortName: string;
    preLim: number | null;
    final: number | null;
    actualTotal: number | null;
    actualAdults: number | null;
    actualChildren: number | null;
    cruiseLineEscorts: number | null;
    transportation: string | null;
    guideName: string | null;
    guideFullName: string | null;
    dockName: string | null;
    dtdAssignmentTransportationId: number | null;
    dTDAssignmentGuideVariableId: string | null; // TODO: verify this type
    dtdAssignmentGuideId: number | null; // TODO: verify this type
    payingAdditionalGuests: number;
    specialNotes: string | null;
    bookingFName: string | null;
    bookingLName: string | null;
    bookingAdults: number;
    bookingChildren: number;
    bookingEmail: string | null;
    bookingPhone: string | null;
    partnerId: number | null;
    totalBooked: number | null;
    isClosed: boolean;
    isOpen: boolean;
    mobleViewColumn: null; // TODO: verify this type
    total: number | null;
    equipmentNumber: number | null;
    maxCapacity?: number;
    tourInventoryEndTime: string;
    tourEndTime: string;
    actualDepartureTime: string | null;
    tourInventoryFromId: number;
    tourInventoryToId: number;
    fromGuests: number | null;
    toGuests: number | null;
    isCancelled: boolean | null;
    cancellationDate: string | null;
    cancellationReason: number | null;
    cancelledby: string | null;
}

export function fromApiAssignments(
    assignments: ApiAssignment[]
): AppAssignment[] {
    return assignments.map((assignment) => fromApiAssignment(assignment));
}

export function fromApiAssignment(assignment: ApiAssignment): AppAssignment {
    const updatedAssignment = {
        ...assignment,
        tourInventoryId: assignment.tourInventoryID,
    };
    delete (updatedAssignment as { tourInventoryID?: number }).tourInventoryID;
    return updatedAssignment;
}
