import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  PackageCheck
} from "lucide-react";
import deliveryService from "../../../services/deliveryService";
import "./DeliveryOverview.css";

const DeliveryOverview = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    activeDeliveries: 0,
    scheduledDeliveries: 0,
    deliveriesToday: 0,
    deliveriesThisWeek: 0,
    deliveriesThisMonth: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDeliverySummary();
  }, []);

  const loadDeliverySummary = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await deliveryService.getDeliverySummary();

      setSummary({
        activeDeliveries: data?.activeDeliveries || 0,
        scheduledDeliveries: data?.scheduledDeliveries || 0,
        deliveriesToday: data?.deliveriesToday || 0,
        deliveriesThisWeek: data?.deliveriesThisWeek || 0,
        deliveriesThisMonth: data?.deliveriesThisMonth || 0
      });
    } catch (err) {
      console.error("Failed to load delivery summary:", err);
      setError("Unable to load delivery information.");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Active Deliveries",
      count: summary.activeDeliveries,
      description: "Orders currently out for delivery",
      icon: Truck,
      route: "/admin/deliveries/active"
    },
    {
      title: "Scheduled Deliveries",
      count: summary.scheduledDeliveries,
      description: "Orders scheduled for future delivery",
      icon: CalendarClock,
      route: "/admin/deliveries/scheduled"
    },
    {
      title: "Deliveries Today",
      count: summary.deliveriesToday,
      description: "Total deliveries scheduled for today",
      icon: CalendarDays,
      route: "/admin/deliveries/today"
    },
    {
      title: "Deliveries This Week",
      count: summary.deliveriesThisWeek,
      description: "Deliveries scheduled for this week",
      icon: CalendarRange,
      route: "/admin/deliveries/week"
    },
    {
      title: "Deliveries This Month",
      count: summary.deliveriesThisMonth,
      description: "Deliveries scheduled for this month",
      icon: PackageCheck,
      route: "/admin/deliveries/month"
    }
  ];

  return (
    <section className="delivery-overview">
      <div className="delivery-overview-header">
        <div>
          <h2>Order Delivery Overview</h2>
          <p>Track active, scheduled and completed delivery activity.</p>
        </div>

        <button
          type="button"
          className="refresh-delivery-button"
          onClick={loadDeliverySummary}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="delivery-error">
          <span>{error}</span>
          <button type="button" onClick={loadDeliverySummary}>
            Retry
          </button>
        </div>
      )}

      <div className="delivery-card-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="delivery-summary-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(card.route)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate(card.route);
                }
              }}
            >
              <div className="delivery-card-top">
                <div className="delivery-icon-wrapper">
                  <Icon size={22} />
                </div>

                <span className="delivery-status-indicator"></span>
              </div>

              <h3>{card.title}</h3>

              <div className="delivery-count">
                {loading ? "..." : card.count}
              </div>

              <p>{card.description}</p>

              <button
                type="button"
                className="delivery-view-button"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(card.route);
                }}
              >
                View Details
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default DeliveryOverview;
