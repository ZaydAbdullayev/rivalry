import "./index.scss";

export const Button = ({ text, action, ...props }) => {
  return (
    <button className="spell-button" onClick={action} {...props}>
      {text}
    </button>
  );
};

export const Button3D = ({ label, action }) => {
  return (
    <button className="button-3d" onClick={action}>
      {label}
    </button>
  );
};
