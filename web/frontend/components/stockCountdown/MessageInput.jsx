import { TextField } from '@shopify/polaris';

export default function MessageInput({ value, onChange, error }) {
  return (
    <TextField
      label=""
      value={value}
      onChange={onChange}
      autoComplete="off"
      helpText="Write message_before {{stock}} message_after"
      error={error}
    />
  );
}
