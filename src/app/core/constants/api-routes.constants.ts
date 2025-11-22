import { environment } from 'src/environments/environment';

const baseUrl = environment.cruiseCodeApiBaseUrl;
const baseEmailUrl = environment.cruiseCodeEmailApiBaseUrl;
export const ApiRoutes = {
    tourInventory: `${baseUrl}TourInventory/`,
    b2c: `${baseUrl}B2C/`,
    cart: `${baseUrl}api/Cart/`,
    agent: `${baseUrl}Agent/`,
    guestDashboard: `${baseUrl}GuestDashboard/`,
    paymentProcessing: `${baseUrl}PaymentProcessAPI/`,
    email: `${baseEmailUrl}EmailAPI/`,
    aspNetUser: `${baseUrl}AspNetUser/`,
    dtd: `${baseUrl}DTD/`,
    employee: `${baseUrl}Employee/`,
    inventoryManagement: `${baseUrl}InventoryManagement/`,
    user: `${baseUrl}User/`,
    userPermission: `${baseUrl}UserPermission/`,
    cruiseCodeFeature: `${baseUrl}CruiseCodeFeature/`,
    form: `${baseUrl}Form/`,
    admin: `${baseUrl}Admin/`,
    cruiseLine: `${baseUrl}api/CruiseLine/`,
    company: `${baseUrl}Company/`,
};
