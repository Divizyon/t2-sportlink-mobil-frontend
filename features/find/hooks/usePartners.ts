import { useFindStore } from '../store/findStore';

export const usePartners = () => {
  const { partners, connectedPartnerIds, connectionRequestSentTo, requestSuccessAnimation } =
    useFindStore(state => ({
      partners: state.partners,
      connectedPartnerIds: state.connectedPartnerIds,
      connectionRequestSentTo: state.connectionRequestSentTo,
      requestSuccessAnimation: state.requestSuccessAnimation,
    }));

  const { connectPartner } = useFindStore(state => ({
    connectPartner: state.connectPartner,
  }));

  // Bir kişi ile bağlantı kurulmuş mu kontrolü
  const isConnected = (partnerId: string) => connectedPartnerIds.includes(partnerId);

  // Bağlantı isteği gönderilmiş mi kontrolü
  const isRequestSent = (partnerId: string) => connectionRequestSentTo === partnerId;

  return {
    partners,
    connectedPartnerIds,
    connectionRequestSentTo,
    requestSuccessAnimation,
    connectPartner,
    isConnected,
    isRequestSent,
  };
};
