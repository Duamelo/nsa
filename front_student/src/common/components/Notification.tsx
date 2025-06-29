import React, { Dispatch, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IStateType } from "../../store/models/root.interface";
import { INotification } from "../../store/models/notification.interface";
import { removeNotification } from "../../store/actions/notifications.action";

const Notifications: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const notifications: INotification[] = useSelector(
    (state: IStateType) => state.notifications.notifications
  );

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      const timeout = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 3000);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [notifications, dispatch]);

  const closeNotification = (id: number) => {
    dispatch(removeNotification(id));
  };

  // Icônes par status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <i className="fas fa-check-circle text-success mr-2"></i>;
      case "error":
        return <i className="fas fa-times-circle text-error mr-2"></i>;
      case "warning":
        return <i className="fas fa-exclamation-triangle text-warning mr-2"></i>;
      case "info":
      default:
        return <i className="fas fa-info-circle text-info mr-2"></i>;
    }
  };

  const notificationList = notifications.map((notification) => {
    return (
      <div
        className={`toast toast-${notification.status}`}
        key={`notification_${notification.id}`}
      >
        <div className="toast-header">
          {/* Icône cloche à gauche du titre */}
          <i className={`fas fa-fw fa-bell text-${notification.status} mr-2`}></i>
          <strong className={`mr-auto text-${notification.status}`}>
            {notification.title}
          </strong>
          <small>
            {notification.date.toLocaleTimeString(navigator.language, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>
          <button
            type="button"
            className="ml-2 mb-1 close"
            data-dismiss="toast"
            aria-label="Close"
            onClick={() => closeNotification(notification.id)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="toast-body text-dark d-flex align-items-start">
          {getStatusIcon(notification.status)}
          <span>{notification.text}</span>
        </div>
      </div>
    );
  });

  return <div className="toast-wrapper">{notificationList}</div>;
};

export default Notifications;
