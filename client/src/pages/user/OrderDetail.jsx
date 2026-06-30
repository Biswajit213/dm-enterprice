import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiDownload } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const downloadInvoice = async (order) => {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const primary = [111, 78, 55];

  // ── Load logo as base64 ────────────────────────────────────
  let logoBase64 = null;
  try {
    const res = await fetch('/logo.jpg');
    const blob = await res.blob();
    logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    // logo not available, will use text fallback
  }

  // ── Header background ──────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageW, 40, 'F');

  // Logo image or text fallback
  if (logoBase64) {
    doc.addImage(logoBase64, 'JPEG', 6, 4, 30, 30);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.circle(20, 20, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(...primary);
    doc.setFont('helvetica', 'bold');
    doc.text('CH', 20, 24, { align: 'center' });
  }

  // Shop name & tagline
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Coffee Haven', 40, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Coffee Shop  |  hello@coffeehaven.com', 40, 24);
  doc.text('123 Coffee Lane, Brew City, CA 90210', 40, 30);

  // INVOICE label (right side)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 215, 0);
  doc.text('INVOICE', pageW - 14, 22, { align: 'right' });

  // ── Invoice meta ────────────────────────────────────────────
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const orderId = order._id.slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  doc.setFont('helvetica', 'bold');
  doc.text('Order ID:', 14, 50);
  doc.text('Date:', 14, 57);
  doc.text('Status:', 14, 64);
  doc.text('Payment:', 14, 71);

  doc.setFont('helvetica', 'normal');
  doc.text(`#${orderId}`, 45, 50);
  doc.text(date, 45, 57);
  doc.text(order.orderStatus, 45, 64);
  doc.text(`${order.paymentInfo?.method?.toUpperCase()} — ${order.paymentInfo?.status?.toUpperCase()}`, 45, 71);

  // ── Bill To ─────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primary);
  doc.text('BILL TO:', pageW / 2, 50);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(order.shippingInfo?.name || '', pageW / 2, 57);
  doc.text(order.shippingInfo?.address || '', pageW / 2, 63);
  doc.text(`${order.shippingInfo?.city || ''}, ${order.shippingInfo?.state || ''} ${order.shippingInfo?.zipCode || ''}`, pageW / 2, 69);
  doc.text(order.shippingInfo?.phone || '', pageW / 2, 75);

  // ── Items table ─────────────────────────────────────────────
  autoTable(doc, {
    startY: 88,
    head: [['#', 'Item', 'Price', 'Qty', 'Total']],
    body: order.items.map((item, i) => [
      i + 1,
      item.name,
      `₹${item.price.toFixed(2)}`,
      item.quantity,
      `₹${(item.price * item.quantity).toFixed(2)}`,
    ]),
    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [250, 246, 243] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Totals ──────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 6;

  const totals = [
    ['Subtotal', `₹${order.itemsPrice?.toFixed(2)}`],
    ['Tax', `₹${order.taxPrice?.toFixed(2)}`],
    ['Shipping', order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice?.toFixed(2)}`],
  ];

  totals.forEach(([label, value], i) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(label, pageW - 55, finalY + i * 6);
    doc.text(value, pageW - 14, finalY + i * 6, { align: 'right' });
  });

  // Total row
  const totalY = finalY + totals.length * 6 + 4;
  doc.setFillColor(...primary);
  doc.roundedRect(pageW - 65, totalY - 5, 51, 10, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', pageW - 55, totalY + 2);
  doc.text(`₹${order.totalPrice?.toFixed(2)}`, pageW - 14, totalY + 2, { align: 'right' });

  // ── Footer ──────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...primary);
  doc.rect(0, pageH - 16, pageW, 16, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Thank you for your order! ☕  coffee-haven-client.onrender.com', pageW / 2, pageH - 7, { align: 'center' });

  doc.save(`CoffeeHaven-Invoice-${orderId}.pdf`);
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" className="min-h-screen" />;
  if (!order) return <div className="text-center py-20 text-sm">Order not found</div>;

  const currentStep = order.orderStatus === 'Cancelled' ? -1 : STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 md:px-8 py-6 sm:py-10">

        <Link to="/orders" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary mb-4 sm:mb-6 transition-colors text-sm">
          <FiArrowLeft size={15} /> Back to Orders
        </Link>

        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-5 sm:mb-8">
          <div>
            <p className="text-gray-400 text-xs">Order #{order._id.slice(-8).toUpperCase()}</p>
            <h1 className="text-xl sm:text-3xl font-heading font-bold text-dark">Order Details</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge text-xs sm:text-sm px-3 py-1.5 ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
            <button
              onClick={() => downloadInvoice(order)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <FiDownload size={15} />
              Download Invoice
            </button>
          </div>
        </div>

        {/* Progress tracker */}
        {order.orderStatus !== 'Cancelled' && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-6 overflow-x-auto">
            <div className="flex items-center justify-between relative min-w-[280px]">
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
              </div>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <p className={`text-xs mt-1.5 ${i <= currentStep ? 'text-primary font-medium' : 'text-gray-400'}`}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
              <h2 className="font-heading font-bold text-base sm:text-lg text-dark mb-3 sm:mb-4">Items Ordered</h2>
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80'}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark text-sm sm:text-base truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs sm:text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm sm:text-base flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary + Shipping */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
              <h2 className="font-heading font-bold text-dark mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                <FiCreditCard size={15} /> Payment
              </h2>
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.itemsPrice?.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{order.taxPrice?.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice?.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold text-dark border-t pt-1.5"><span>Total</span><span>₹{order.totalPrice?.toFixed(2)}</span></div>
              </div>
              <div className="mt-2 pt-2 border-t text-xs sm:text-sm">
                <p className="text-gray-600">Method: <span className="font-medium capitalize">{order.paymentInfo?.method}</span></p>
                <p className="text-gray-600">Status: <span className={`font-medium ${order.paymentInfo?.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentInfo?.status}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
              <h2 className="font-heading font-bold text-dark mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
                <FiMapPin size={15} /> Shipping Address
              </h2>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-dark">{order.shippingInfo?.name}</p>
                <p>{order.shippingInfo?.address}</p>
                <p>{order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}</p>
                <p>{order.shippingInfo?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
