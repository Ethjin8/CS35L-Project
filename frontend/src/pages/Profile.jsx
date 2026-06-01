import "./Profile.css";
import profilePic from "../assets/profile-pic.svg";
import { useState, useEffect } from 'react';
import { getLoggedInUser } from '../lib/getLoggedInUser';
import { authFetch } from '../lib/authFetch';

const STREAMING_SERVICES = [
  'Netflix',
  'Hulu',
  'Disney+',
  'Crunchyroll',
  'Prime Video',
  'Apple TV',
  'Peacock',
  'Paramount+',
];

export default function Profile() {
    const [selectedServices, setSelectedServices] = useState(() => {
      return JSON.parse(localStorage.getItem("selectedServices")) || [];
    });
    const user = getLoggedInUser();

    useEffect(() => {
      async function loadServices() {
        try {
          const res = await authFetch('/api/streaming');
          if (!res.ok) return;
          const data = await res.json();
          const services = data.map((r) => r.streaming_service);
          setSelectedServices(services);
          localStorage.setItem("selectedServices", JSON.stringify(services));
        } catch {
          // fall back to localStorage cache
        }
      }
      loadServices();
    }, []);

    async function toggleService(service) {
      const wasSelected = selectedServices.includes(service);
      const next = wasSelected
        ? selectedServices.filter((s) => s !== service)
        : [...selectedServices, service];

      setSelectedServices(next);
      localStorage.setItem("selectedServices", JSON.stringify(next));

      try {
        if (wasSelected) {
          await authFetch('/api/streaming', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ streaming: service }),
          });
        } else {
          await authFetch('/api/streaming', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ streaming: service }),
          });
        }
      } catch {
        setSelectedServices(selectedServices);
        localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
      }
    }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <img
              className="profile-avatar"
              src={profilePic}
              alt={`${user?.username || 'User'}'s profile`}
            />
          </div>
          <div className="profile-description">
            <p className="profile-kicker">ACCOUNT</p>
            <h1 className="profile-username">@{user?.username || 'Error'}</h1>
            <p className="profile-subtitle">Your watch identity.</p>
          </div>
        </div>

        <div className="service-section">
          <div className="section-title-row">
            <h2 className="service-section-title">STREAMING SERVICES</h2>
            <span className="service-count">
              {selectedServices.length} selected
            </span>
          </div>

          <p className="service-pick">
            Pick the platforms you use.
          </p>

          <div className="service-grid">
            {STREAMING_SERVICES.map((service) => {
              //variable to check if the current service is included in the
              // selectedServices array, which is used to determine the
              // button's appearance and label.
              const isSelected = selectedServices.includes(service);

              return (
                <button
                  key={service}
                  type="button"
                  className={`service-tile ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleService(service)}
                >
                  <span className="service-label-top">
                    {isSelected ? 'WATCH ON' : 'ADD'}
                  </span>
                  <span className="service-label-name">{service}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}