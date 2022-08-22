import { render } from '@testing-library/react';
import ContextProvider from 'tests/ContextProider';
import NumericInput from './NumericInput';
import userEvent from '@testing-library/user-event';

describe('NumericInput', () => {
  test('happy path', async () => {
    const onChangeMock = jest.fn();

    const result = render(
      <ContextProvider>
        <NumericInput value={''} onChange={onChangeMock} placeholder={'MyNumericInput'} />
      </ContextProvider>
    );
    const input = result.getByPlaceholderText('MyNumericInput');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(null);
    await userEvent.type(input, '1');
    expect(onChangeMock).toBeCalledWith(expect.any(Object), '1');
  });
  test('ignores non number', async () => {
    const onChangeMock = jest.fn();

    const result = render(
      <ContextProvider>
        <NumericInput value={''} onChange={onChangeMock} placeholder={'MyNumericInput'} />
      </ContextProvider>
    );
    const input = result.getByPlaceholderText('MyNumericInput');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(null);
    await userEvent.type(input, 'abc');
    expect(onChangeMock).not.toBeCalled();
  });
});
