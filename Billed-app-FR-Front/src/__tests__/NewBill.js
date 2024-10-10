/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor, within } from "@testing-library/dom"
import '@testing-library/jest-dom';
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store.js"
import userEvent from "@testing-library/user-event"
import { bills } from "../fixtures/bills.js"
import { ROUTES } from "../constants/routes.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I can upload a file with a valid extension", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const instance = new NewBill({ document, onNavigate: null, store, localStorage: localStorageMock });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: 'C:\\fakepath\\example.png'
        }
      }
      const createSpy = jest.spyOn(store.bills(), 'create')
      instance.handleChangeFile(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(createSpy).toHaveBeenCalled()
      createSpy.mockRestore()
    })
    test("Then I cannot upload a file with invalid extension", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const instance = new NewBill({ document, onNavigate: null, store, localStorage: localStorageMock });
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: 'C:\\fakepath\\example.txt'
        }
      }
      const createSpy = jest.spyOn(store.bills(), 'create')
      instance.handleChangeFile(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(createSpy).not.toHaveBeenCalled()
      createSpy.mockRestore()
    })
    test("Then I can submit the form", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const instance = new NewBill({ document, onNavigate, store, localStorage: localStorageMock });

      const inputData = bills[0]

      const handleSubmit = jest.fn(instance.handleSubmit);
      
      const file = new File(["img"], inputData.fileName, {
        type: [["image/jpg"]],
      });

      const dropdown = screen.getByRole("combobox");
      userEvent.selectOptions(
        dropdown,
        within(dropdown).getByRole("option", { name: inputData.type })
      );

      document.body.innerHTML = NewBillUI()
      await waitFor(() => screen.getByTestId('form-new-bill'))
      const form = screen.getByTestId('form-new-bill')

      const expenseName = screen.getByTestId('expense-name')
      userEvent.type(expenseName, inputData.name)

      const dateInput = screen.getByTestId('datepicker')
      // Impossible de mettre à jour avec un userEvent...
      fireEvent.change(dateInput, { target: { value: inputData.date }})

      const amount = screen.getByTestId('amount')
      userEvent.type(amount, inputData.amount.toString())

      const vat = screen.getByTestId('vat')
      userEvent.type(vat, inputData.vat.toString())

      const percent = screen.getByTestId('pct')
      userEvent.type(percent, inputData.pct.toString())

      const commentary = screen.getByTestId('commentary')
      userEvent.type(commentary, inputData.commentary)

      expect(dropdown.validity.valueMissing).toBeFalsy()
      expect(dateInput.validity.valueMissing).toBeFalsy();
      expect(amount.validity.valueMissing).toBeFalsy();
      expect(percent.validity.valueMissing).toBeFalsy();
      
      instance.fileName = file.name
      
      const submitButton = screen.getByRole("button", { name: /envoyer/i });
      expect(submitButton.type).toBe("submit");

      form.addEventListener("submit", handleSubmit);
      userEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);

      await waitFor(() => screen.getByText(/Mes notes de frais/i))
      expect(screen.getByText(/Mes notes de frais/i)).toBeVisible();
    })
  })
})
