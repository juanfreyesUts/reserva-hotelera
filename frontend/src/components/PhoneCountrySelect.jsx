import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { PHONE_CODES } from '../utils/phoneCodes';

// Construye las opciones en el formato que espera react-select
const options = PHONE_CODES.map(c => ({
  value: c.code,
  label: c.name,
  dialCode: c.dialCode,
  code: c.code,
}));

const FlagImg = ({ code }) => (
  <img
    src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
    srcSet={`https://flagcdn.com/w40/${code.toLowerCase()}.png 2x`}
    alt={code}
    style={{ width: 20, height: 'auto', borderRadius: 2, flexShrink: 0 }}
  />
);
FlagImg.propTypes = { code: PropTypes.string.isRequired };

// Equivalente a templateResult / templateSelection de Select2
const formatOptionLabel = (option, { context }) => {
  if (context === 'value') {
    // Lo que se muestra en el trigger (campo cerrado): bandera + indicativo
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FlagImg code={option.code} />
        <span style={{ fontWeight: 500, fontSize: 14, color: '#374151' }}>
          {option.dialCode}
        </span>
      </div>
    );
  }
  // Lo que se muestra dentro del dropdown: bandera + país + indicativo
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <FlagImg code={option.code} />
      <span style={{ flex: 1, fontSize: 14, color: '#374151' }}>{option.label}</span>
      <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>{option.dialCode}</span>
    </div>
  );
};

const selectStyles = {
  control: (base) => ({
    ...base,
    border: '1px solid #d1d5db',
    borderRight: '1px solid #d1d5db',
    borderRadius: '0.5rem 0 0 0.5rem',
    boxShadow: 'none',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    minWidth: 100,
    flexShrink: 0,
    '&:hover': { borderColor: '#d1d5db' },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '4px 6px 4px 10px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0 8px 0 2px',
    color: '#9ca3af',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -2px rgba(0,0,0,0.07)',
    border: '1px solid #e5e7eb',
    minWidth: 230,
    zIndex: 50,
    overflow: 'hidden',
    marginTop: 4,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
    maxHeight: 210,
  }),
  option: (base, { isSelected, isFocused }) => {
    let backgroundColor = 'white';
    if (isSelected) backgroundColor = '#eef2ff';
    else if (isFocused) backgroundColor = '#f5f3ff';
    return {
      ...base,
      backgroundColor,
      color: isSelected ? '#4338ca' : '#374151',
      cursor: 'pointer',
      padding: '8px 12px',
      fontWeight: isSelected ? 600 : 400,
    };
  },
  input: (base) => ({
    ...base,
    fontSize: 14,
    color: '#374151',
  }),
  singleValue: (base) => ({
    ...base,
    margin: 0,
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: 14,
  }),
};

PhoneCountrySelect.propTypes = {
  value: PropTypes.shape({ code: PropTypes.string.isRequired }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function PhoneCountrySelect({ value, onChange }) {
  const selected = options.find(o => o.value === value.code) ?? options[0];

  const handleChange = (option) => {
    const country = PHONE_CODES.find(c => c.code === option.value);
    if (country) onChange(country);
  };

  return (
    <Select
      value={selected}
      onChange={handleChange}
      options={options}
      formatOptionLabel={formatOptionLabel}
      styles={selectStyles}
      isSearchable
      placeholder=""
      noOptionsMessage={() => 'Sin resultados'}
    />
  );
}
