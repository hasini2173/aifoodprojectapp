import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteRestaurant } from "../redux/actions/restaurantAction";
import api from "../utils/api";

const Restaurant = ({ restaurant }) => {
  const dispatch = useDispatch();

  const [showAI, setShowAI] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiData, setAiData] = useState(null);

  const { isAuthenticated, user } = useSelector(
    (state) => state.user || {}
  );

  // AI Summary
  const handleAISummary = async () => {
    // Hide if already open
    if (showAI) {
      setShowAI(false);
      return;
    }

    // If already fetched, just show it
    if (aiData) {
      setShowAI(true);
      return;
    }

    try {
      setLoadingAI(true);

      const { data } = await api.put(
        `/v1/ai/admin/restaurants/${restaurant._id}/analyze`
      );

      console.log("AI Response:", data);

      setAiData(data.aiData);
      setShowAI(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI Review Summary");
    } finally {
      setLoadingAI(false);
    }
  };

  // Delete Restaurant
  const handleDelete = () => {
    if (!window.confirm("Delete this restaurant?")) return;

    dispatch(deleteRestaurant(restaurant._id)).catch(() => {
      alert("Unable to delete");
    });
  };

  return (
    <div className="col-12 my-3">
      <div className="card restaurant-card p-3">
        <Link to={`/eats/stores/${restaurant._id}/menus`}>
          <img
            className="restaurant-image"
            src={restaurant.images?.[0]?.url}
            alt={restaurant.name}
          />
        </Link>

        <div className="restaurant-info">
          <h4>{restaurant.name}</h4>

          <p className="rest_address">
            {restaurant.address}
          </p>

          <div className="ratings">
            <div className="rating-outer">
              <div
                className="rating-inner"
                style={{
                  width: `${(restaurant.ratings / 5) * 100}%`,
                }}
              ></div>
            </div>

            <span>({restaurant.numOfReviews} Reviews)</span>
          </div>

          <button
            className="ai-btn mt-2"
            onClick={handleAISummary}
            disabled={loadingAI}
          >
            {loadingAI
              ? "Generating..."
              : showAI
              ? "➖ Hide Summary"
              : "💬 View Review Summary"}
          </button>
        </div>

        {showAI && aiData && (
          <div className="ai-insights-box mt-3">
            <div className="ai-status">
              <strong>Review Sentiment:</strong>{" "}
              <span>{aiData.sentiment}</span>
            </div>

            <br />

            <strong>Summary</strong>

            <ul>
              {aiData.summaryBullets?.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            <strong>Top Mentions</strong>

            <div className="mentions">
              {aiData.topMentions?.map((item, index) => (
                <span
                  key={index}
                  className="mention-tag"
                  style={{ marginRight: "8px" }}
                >
                  #{item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAuthenticated && user?.role === "admin" && (
        <button
          className="btn btn-danger btn-sm mt-2"
          onClick={handleDelete}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default Restaurant;