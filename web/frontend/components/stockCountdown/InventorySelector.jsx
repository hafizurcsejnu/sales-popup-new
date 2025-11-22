import { TextField } from '@shopify/polaris';

export default function InventorySelector({ value, onChange, error }) {
  return (
    <TextField
      label=""
      type="number"
      value={value.toString()}
      onChange={(val) => onChange(parseInt(val))}
      autoComplete="off"
      error={error}
    />
  );
}
