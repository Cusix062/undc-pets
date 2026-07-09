import React, { useState, useEffect } from 'react';
import { DonationCampana, DonationConfig, PendingDonation } from '../types';

interface DonationCampaignsProps {
  config: DonationConfig;
  onAddPendingDonation: (pending: PendingDonation) => void;
  onShowNotification: (msg: string) => void;
}

export default function DonationCampaigns({ config, onAddPendingDonation, onShowNotification }: DonationCampaignsProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampana | null>(null);

  // Payment gateway states
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donationAmount, setDonationAmount] = useState('20');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [donationReceipt, setDonationReceipt] = useState<{
    id: string;
    donor: string;
    amount: number;
    campaign: string;
    date: string;
  } | null>(null);

  // Compute pending amounts per campaign
  const pendingByCampaign: Record<string, number> = {};
  for (const pd of config.pendingDonations || []) {
    if (!pd.verified) {
      pendingByCampaign[pd.campaignId] = (pendingByCampaign[pd.campaignId] || 0) + pd.amount;
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowNotification(`¡${label} copiado al portapapeles!`);
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(donationAmount);
    if (!donorName || !donorEmail || isNaN(amountVal) || amountVal <= 0) {
      alert('Por favor, ingresa datos de donación válidos.');
      return;
    }

    if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCVV.length < 3) {
      alert('Por favor, completa los datos de la tarjeta simulada.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate payment processing time
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingProgress(100);
      if (selectedCampaign) {
        const pending: PendingDonation = {
          id: `pd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          campaignId: selectedCampaign.id,
          donorName,
          donorEmail,
          amount: amountVal,
          date: new Date().toISOString(),
          verified: false,
        };
        onAddPendingDonation(pending);

        // Generate receipt
        setDonationReceipt({
          id: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
          donor: donorName,
          amount: amountVal,
          campaign: selectedCampaign.title,
          date: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        });

        onShowNotification(`¡Gracias ${donorName}! Tu donación de S/. ${amountVal} está pendiente de verificación.`);
      }
    }, 1500);
  };

  // Animate processing progress bar
  useEffect(() => {
    if (isProcessing) {
      setProcessingProgress(0);
      const startTime = Date.now();
      const duration = 1500;
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 99);
        setProcessingProgress(progress);
        if (progress >= 99) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleCloseGateway = () => {
    setSelectedCampaign(null);
    setDonationReceipt(null);
    setDonorName('');
    setDonorEmail('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
  };

  return (
    <div id="donation-campaigns-section" className="space-y-8 animate-fade-in">

      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-[#00346f] to-[#0050aa] rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-2/3 space-y-3">
          <span className="bg-[#fc9d41] text-[#6b3900] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            Causa Solidaria
          </span>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
            Campañas de Recaudación y Alimentación
          </h2>
          <p className="text-sm text-slate-100 leading-relaxed">
            Las vacunas, cirugías, tratamientos de salud y raciones diarias de comida para Bobby, Firulais, Luna y todos nuestros amigos son costeadas enteramente por donaciones de estudiantes, docentes y vecinos cañetanos. ¡Tu aporte hace la diferencia!
          </p>
        </div>
        <div className="md:w-1/3 flex justify-center">
          <span className="material-symbols-outlined text-[100px] text-white/20 select-none">volunteer_activism</span>
        </div>
      </div>

      {/* Campaigns list */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          Metas y Objetivos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {config.campaigns.map((camp) => {
            const percent = Math.min(Math.round((camp.currentAmount / camp.targetAmount) * 100), 100);
            const pendingAmt = pendingByCampaign[camp.id] || 0;

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between transition-all duration-500"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start relative">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      camp.urgency === 'Alta' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-[#eef4ff] text-primary border border-[#dfe9fa]'
                    }`}>
                      {camp.urgency} Prioridad
                    </span>
                    <span className="text-slate-400 material-symbols-outlined">heart_broken</span>
                  </div>

                  <h4 className="font-display font-bold text-sm text-slate-900 leading-tight">
                    {camp.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {camp.description}
                  </p>
                </div>

                {/* Progress bar thermometer */}
                <div className="space-y-2 my-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#00346f]">S/. {camp.currentAmount.toLocaleString()}</span>
                    <span className="text-slate-400">Meta: S/. {camp.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-[1500ms] ease-out ${
                        percent >= 100
                          ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-[#fc9d41] via-[#fa8b23] to-[#fc9d41]'
                      }`}
                      style={{ width: `${percent}%` }}
                    >
                      {percent > 0 && percent < 100 && (
                        <div className="h-full w-full bg-white/20 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      {percent >= 100 ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          ¡Meta lograda!
                        </span>
                      ) : (
                        <>{percent}% Completado</>
                      )}
                    </span>
                    {percent < 100 && (
                      <span className="text-[#00346f]">
                        Faltan S/. {(camp.targetAmount - camp.currentAmount).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {pendingAmt > 0 && (
                    <div className="text-[10px] text-amber-600 font-bold flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[12px]">pending</span>
                      S/. {pendingAmt} en verificación
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedCampaign(camp)}
                  className="w-full bg-[#00346f] hover:bg-[#002450] text-white text-xs font-bold py-2 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">credit_card</span>
                  Donar con Tarjeta
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account number details and drop-off points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">

        {/* Copy accounts from config */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fc9d41] font-bold">content_copy</span>
              Cuentas Bancarias Institucionales
            </h3>
            <p className="text-xs text-slate-400">Transfiere de manera directa y segura. Copia los datos con un clic:</p>
          </div>

          <div className="space-y-3">
            {(config.accounts || []).map((acc, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#00346f]">{acc.bank}</span>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-sm text-[9px] font-semibold uppercase">Oficial</span>
                </div>

                <div className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-slate-100">
                  <span className="font-mono text-slate-700 select-all font-semibold">{acc.number}</span>
                  <button
                    onClick={() => handleCopy(acc.number, 'Número')}
                    className="text-primary hover:text-[#002450] flex items-center gap-1 text-[11px] font-bold"
                    title="Copiar número"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copiar
                  </button>
                </div>

                {acc.CCI && acc.CCI.includes('-') && (
                  <div className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-mono text-slate-500 text-[11px]">CCI: {acc.CCI}</span>
                    <button
                      onClick={() => handleCopy(acc.CCI, 'CCI')}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[10px] font-bold"
                      title="Copiar CCI"
                    >
                      <span className="material-symbols-outlined text-[12px]">content_copy</span>
                      CCI
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Drop off Points and Instructions */}
        <div className="bg-[#eef4ff] rounded-2xl border border-[#dfe9fa] p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Puntos de Acopio Físicos (Alimentos / Medicinas)
            </h3>
            <p className="text-xs text-slate-500">¿Deseas donar raciones de alimento para perro/gato o medicinas veterinarias?</p>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <p className="font-medium leading-relaxed">
              Puedes dejar tus donaciones en cualquiera de los siguientes puntos autorizados dentro de la Universidad Nacional de Cañete:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">home_pin</span>
                <div>
                  <p className="font-bold text-slate-800">Puerta Principal del Campus (Vigilancia)</p>
                  <p className="text-[11px] text-slate-500">Lunes a Sábado, 08:00 AM - 06:00 PM. Consigna que es para el voluntariado de bienestar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">corporate_fare</span>
                <div>
                  <p className="font-bold text-slate-800">Oficina de Bienestar Universitario</p>
                  <p className="text-[11px] text-slate-500">Pabellón de Servicios Centrales, Segundo Piso. Atención en horario académico.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-[#dfe9fa] mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-[#6b3900]">
              <span className="material-symbols-outlined text-[#fc9d41] font-bold text-[20px]">info</span>
              <span>
                <strong>Marcas Recomendadas:</strong> Para mantener saludable la digestión de las mascotas, el voluntariado recomienda alimento de marcas registradas (como Ricocan, Ricocat, Mimaskot, Cambo o similares). Evita alimento suelto o a granel.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* QR Payment Methods Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fc9d41] font-bold">qr_code_scanner</span>
              Paga con Yape, Plin y más
            </h3>
            <p className="text-xs text-slate-400">Escanea el código QR desde tu app y dona al instante:</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center space-y-2 hover:shadow-md transition-shadow">
            <div className="bg-white rounded-lg p-2 mx-auto w-32 h-32 flex items-center justify-center border border-slate-100">
              <img
                src={config.qrCodes?.yape || '/images/yape.jpeg'}
                alt="QR Yape"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-bold text-xs text-slate-800">Yape</p>
            <p className="text-[10px] text-slate-400">{config.yapeNumber}</p>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center space-y-2 hover:shadow-md transition-shadow">
            <div className="bg-white rounded-lg p-2 mx-auto w-32 h-32 flex items-center justify-center border border-slate-100">
              <img
                src={config.qrCodes?.plin || '/images/plin.jpeg'}
                alt="QR Plin"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-bold text-xs text-slate-800">Plin</p>
            <p className="text-[10px] text-slate-400">{config.plinNumber}</p>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center space-y-2 hover:shadow-md transition-shadow">
            <div className="bg-white rounded-lg p-2 mx-auto w-32 h-32 flex items-center justify-center border border-slate-100">
              <img
                src={config.qrCodes?.bcp || '/images/qr-bcp.svg'}
                alt="QR BCP"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-bold text-xs text-slate-800">BCP</p>
            <p className="text-[10px] text-slate-400">Ver cuenta bancaria</p>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 text-center space-y-2 hover:shadow-md transition-shadow">
            <div className="bg-white rounded-lg p-2 mx-auto w-32 h-32 flex items-center justify-center border border-slate-100">
              <img
                src={config.qrCodes?.tunqui || '/images/qr-tunqui.svg'}
                alt="QR Tunqui"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="font-bold text-xs text-slate-800">Tunqui</p>
            <p className="text-[10px] text-slate-400">Bienestar UNDC</p>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-up max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleCloseGateway}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full p-2 z-10 transition-colors"
              title="Cerrar pasarela"
            >
              <span className="material-symbols-outlined text-[18px] block">close</span>
            </button>

            <div className="p-6 overflow-y-auto">

              {!donationReceipt ? (
                /* Payment form */
                <form onSubmit={handleDonateSubmit} className="space-y-4">
                  <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
                    <span className="material-symbols-outlined text-[36px] text-primary">credit_card</span>
                    <h3 className="font-display font-extrabold text-lg text-slate-900">Pasarela de Pago Segura</h3>
                    <p className="text-xs text-slate-500">
                      Campaña: <strong className="text-primary">{selectedCampaign.title}</strong>
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">

                    {/* Donor name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nombre del Donante</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Ej. Juan Carlos Ramos"
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary bg-slate-50"
                      />
                    </div>

                    {/* Donor email */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Correo Electrónico (Para envío de constancia)</label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="Ej. jperez@undc.edu.pe"
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary bg-slate-50"
                      />
                    </div>

                    {/* Donation Amount selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Monto a Donar (S/. Soles)</label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {['10', '20', '50', '100'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDonationAmount(val)}
                            className={`py-1.5 rounded-lg border font-bold text-center transition-all ${
                              donationAmount === val
                                ? 'bg-[#00346f] text-white border-primary'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            S/. {val}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Otro monto diferente..."
                        min="1"
                        required
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary bg-slate-50"
                      />
                    </div>

                    {/* Card details */}
                    <div className="bg-[#eef4ff] p-3 rounded-xl border border-slate-200 space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Tarjeta Simulada de Pruebas</p>

                      <div>
                        <input
                          type="text"
                          maxLength={16}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Número de Tarjeta (16 dígitos)"
                          required
                          className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary bg-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/AA"
                          required
                          className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary bg-white text-center font-mono"
                        />
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                          placeholder="CVV"
                          required
                          className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary bg-white text-center font-mono"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="space-y-2 mt-4">
                    {isProcessing && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                          <span>Procesando donación...</span>
                          <span>{Math.round(processingProgress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-150 ease-out"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                          Confirmar Donación S/. {donationAmount}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Thank you receipt certificate */
                <div className="space-y-5 py-4 text-center animate-scale-up">
                  <span className="material-symbols-outlined text-[64px] text-amber-500">hourglass_bottom</span>

                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-xl text-slate-900">¡Gracias por tu Solidaridad!</h3>
                    <p className="text-xs text-slate-500">Tu donación está pendiente de verificación por el administrador.</p>
                  </div>

                  {/* Receipt Box styled like official certificate */}
                  <div className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-200 text-left space-y-2.5 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-[#00346f]">UNDC Pets - Bienestar Animal</span>
                      <span className="font-mono text-[10px] text-slate-400">{donationReceipt.id}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">Donante:</span>
                      <span className="col-span-2 font-bold text-slate-800">{donationReceipt.donor}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">Monto Donado:</span>
                      <span className="col-span-2 font-bold text-emerald-600 text-sm">S/. {donationReceipt.amount} Soles</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">Destinado a:</span>
                      <span className="col-span-2 font-medium text-slate-700">{donationReceipt.campaign}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">Estado:</span>
                      <span className="col-span-2 font-medium text-amber-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">pending</span>
                        Pendiente de verificación
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2">
                      <span className="text-slate-400 font-medium">Fecha y Hora:</span>
                      <span className="col-span-2 text-slate-600 font-mono text-[10px]">{donationReceipt.date}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Hemos enviado un correo a <strong>{donorEmail}</strong> con la constancia oficial. Una vez que el administrador verifique el pago, el monto se reflejará en la barra de progreso de la campaña.
                  </div>

                  <button
                    onClick={handleCloseGateway}
                    className="w-full bg-[#00346f] hover:bg-[#002450] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs"
                  >
                    Volver a Campañas
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
