import { api } from './api'
export const checkNextFifthCustomer = async (
    branchId: string,
): Promise<void> => {
    await api.get(`/fcmNotification/check-next-fifth?branchId=${branchId}`)
}
