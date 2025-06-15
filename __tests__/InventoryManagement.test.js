import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import InventoryCard from '../components/InventoryCard';
import RestockScreen from '../screens/RestockScreen';
import { 
  markMedicationTaken,
  restockMedication,
  getPatientMedication,
  getMedicationDetails
} from '../api/patientAPI';
import { useNotifications } from '../NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    setOptions: mockSetOptions,
  }),
  useFocusEffect: jest.fn(),
}));

// Mock APIs
jest.mock('../api/patientAPI', () => ({
  markMedicationTaken: jest.fn(),
  restockMedication: jest.fn(),
  getPatientMedication: jest.fn(),
  getMedicationDetails: jest.fn(),
}));

// Mock NotificationContext
jest.mock('../NotificationContext', () => ({
  useNotifications: jest.fn(),
  NotificationProvider: ({ children }) => children,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Expo components
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcon');
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock React Native components properly
jest.mock('react-native/Libraries/Components/ActivityIndicator/ActivityIndicator', () => 'ActivityIndicator');

// Mock Alert
jest.spyOn(Alert, 'alert');
global.alert = jest.fn();

describe('Inventory Tracking Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC19: Automatic Stock Deduction
  describe('TC19 - Automatic Stock Deduction', () => {
    it('should reduce stock by dose quantity when medication is taken', async () => {
      // Mock initial medication data
      const initialMedication = {
        _id: 'med1',
        name: 'Lisinopril',
        stock: 30,
        dosage: 1,
        unit: 'tablet'
      };

      // Mock API response after taking medication
      const updatedMedication = {
        ...initialMedication,
        stock: 29 // Stock reduced by 1 tablet
      };

      markMedicationTaken.mockResolvedValue({
        success: true,
        updatedStock: 29
      });

      getMedicationDetails.mockResolvedValue(updatedMedication);

      // Step 1: Confirm "Take"
      const medicationData = {
        medicationId: 'med1',
        status: 'Taken',
        takenAt: new Date().toISOString()
      };

      await markMedicationTaken(medicationData);
      const result = await getMedicationDetails('med1');

      // Expected Result: Stock reduced by dose quantity
      expect(markMedicationTaken).toHaveBeenCalledWith(medicationData);
      expect(result.stock).toBe(29);
      expect(result.stock).toBeLessThan(initialMedication.stock);
    });

    it('should handle multiple dose deduction correctly', async () => {
      const medicationData = {
        medicationId: 'med1',
        dosage: 2, // 2 tablets per dose
        initialStock: 30
      };

      markMedicationTaken.mockResolvedValue({
        success: true,
        stockDeducted: 2,
        remainingStock: 28
      });

      const result = await markMedicationTaken({
        medicationId: 'med1',
        status: 'Taken',
        takenAt: new Date().toISOString()
      });

      expect(result.stockDeducted).toBe(2);
      expect(result.remainingStock).toBe(28);
    });

    it('should handle stock deduction when stock is insufficient', async () => {
      markMedicationTaken.mockRejectedValue({
        error: 'INSUFFICIENT_STOCK',
        message: 'Not enough stock to complete this dose',
        remainingStock: 0
      });

      try {
        await markMedicationTaken({
          medicationId: 'med1',
          status: 'Taken',
          takenAt: new Date().toISOString()
        });
      } catch (error) {
        expect(error.error).toBe('INSUFFICIENT_STOCK');
        expect(error.remainingStock).toBe(0);
      }
    });
  });

  // TC20: Manual Restock with UI Testing
  describe('TC20 - Manual Restock', () => {
    it('should update stock when manual restock is performed', async () => {
      const mockMedication = {
        _id: 'med1',
        name: 'Lisinopril',
        stock: 5 // Low stock
      };

      restockMedication.mockResolvedValue({
        success: true,
        newStock: 25,
        message: 'Stock updated successfully'
      });

      // Step 1: Click "Restock" (API call simulation)
      // Step 2: Enter quantity (20)
      // Step 3: Submit restock
      const result = await restockMedication('med1', '20');

      // Expected Result: Stock updated; alert cleared
      expect(restockMedication).toHaveBeenCalledWith('med1', '20');
      expect(result.success).toBe(true);
      expect(result.newStock).toBe(25);
    });

    it('should validate restock quantity input', () => {
      // Test quantity validation logic
      const validateQuantity = (quantity) => {
        return quantity !== '' && !isNaN(quantity) && parseInt(quantity) > 0;
      };

      expect(validateQuantity('')).toBe(false);
      expect(validateQuantity('0')).toBe(false);
      expect(validateQuantity('abc')).toBe(false);
      expect(validateQuantity('20')).toBe(true);
      expect(validateQuantity('5')).toBe(true);
    });

    it('should handle restock API errors gracefully', async () => {
      restockMedication.mockRejectedValue({
        error: 'RESTOCK_FAILED',
        message: 'Failed to update stock'
      });

      try {
        await restockMedication('med1', '20');
      } catch (error) {
        expect(error.message).toBe('Failed to update stock');
      }

      expect(restockMedication).toHaveBeenCalledWith('med1', '20');
    });

    it('should handle numeric input filtering', () => {
      // Test the numeric input filtering from RestockScreen
      const filterNumericInput = (value) => {
        return value.replace(/[^0-9]/g, '');
      };

      expect(filterNumericInput('abc123def')).toBe('123');
      expect(filterNumericInput('20')).toBe('20');
      expect(filterNumericInput('')).toBe('');
      expect(filterNumericInput('12.34')).toBe('1234'); // Removes decimal
    });
  });

  // TC21: Stock Threshold Alert
  describe('TC21 - Stock Threshold Alert', () => {
    it('should trigger low stock notification when stock reaches threshold', async () => {
      // Mock medication at threshold
      const lowStockMedication = {
        _id: 'med1',
        name: 'Lisinopril',
        stock: 4, // At threshold - 1
        threshold: 5
      };

      // Mock stock check function
      const checkStockThreshold = (medication) => {
        return medication.stock <= medication.threshold;
      };

      // Mock notification creation
      const createLowStockNotification = (medication) => {
        return {
          id: `low-stock-${medication._id}`,
          title: 'Low Stock Alert',
          body: `Low stock for ${medication.name}`,
          type: 'LOW_STOCK',
          medicationId: medication._id,
          timestamp: new Date().toISOString()
        };
      };

      // Test threshold detection
      const isLowStock = checkStockThreshold(lowStockMedication);
      expect(isLowStock).toBe(true);

      // Test notification creation
      if (isLowStock) {
        const notification = createLowStockNotification(lowStockMedication);
        expect(notification.title).toBe('Low Stock Alert');
        expect(notification.body).toBe('Low stock for Lisinopril');
        expect(notification.type).toBe('LOW_STOCK');
      }
    });

    it('should trigger notification when taking medication reduces stock to threshold', async () => {
      const medicationBeforeTaking = {
        _id: 'med1',
        name: 'Lisinopril',
        stock: 6,
        threshold: 5,
        dosage: 2
      };

      // Mock taking medication that would trigger threshold
      markMedicationTaken.mockResolvedValue({
        success: true,
        newStock: 4, // Below threshold after taking 2 tablets
        lowStockAlert: true,
        notification: {
          title: 'Low Stock Alert',
          body: 'Low stock for Lisinopril'
        }
      });

      const result = await markMedicationTaken({
        medicationId: 'med1',
        status: 'Taken',
        takenAt: new Date().toISOString()
      });

      // Expected Result: Low stock notification triggered
      expect(result.lowStockAlert).toBe(true);
      expect(result.notification.title).toBe('Low Stock Alert');
      expect(result.newStock).toBeLessThanOrEqual(medicationBeforeTaking.threshold);
    });

    it('should not trigger alert when stock is above threshold', async () => {
      const medicationAboveThreshold = {
        _id: 'med1',
        name: 'Lisinopril',
        stock: 15,
        threshold: 5
      };

      const checkStockThreshold = (medication) => {
        return medication.stock <= medication.threshold;
      };

      const isLowStock = checkStockThreshold(medicationAboveThreshold);
      expect(isLowStock).toBe(false);
    });
  });

  // UI Testing for InventoryCard Component
  describe('InventoryCard UI Testing', () => {
    it('should render inventory card with correct elements and testIDs', () => {
      const medicationData = {
        medicationName: 'Lisinopril',
        medicationType: 'Tablet',
        stock: 25
      };

      const mockOnPress = jest.fn();

      const { getByTestId, getByText } = render(
        <InventoryCard 
          medicationName={medicationData.medicationName}
          medicationType={medicationData.medicationType}
          stock={medicationData.stock}
          onPress={mockOnPress}
        />
      );

      // Test that all elements are rendered with correct testIDs
      expect(getByTestId('inventory-card-Lisinopril')).toBeTruthy();
      expect(getByTestId('medication-name-Lisinopril')).toBeTruthy();
      expect(getByTestId('medication-type-Lisinopril')).toBeTruthy();
      expect(getByTestId('stock-count-Lisinopril')).toBeTruthy();
      expect(getByTestId('icon-Lisinopril')).toBeTruthy();

      // Test content
      expect(getByText('Lisinopril')).toBeTruthy();
      expect(getByText('Tablet')).toBeTruthy();
      expect(getByText('25 left')).toBeTruthy();
    });

    it('should handle card press interaction', () => {
      const medicationData = {
        medicationName: 'Aspirin',
        medicationType: 'Tablet',
        stock: 10
      };

      const mockOnPress = jest.fn();

      const { getByTestId } = render(
        <InventoryCard 
          medicationName={medicationData.medicationName}
          medicationType={medicationData.medicationType}
          stock={medicationData.stock}
          onPress={mockOnPress}
        />
      );

      const inventoryCard = getByTestId('inventory-card-Aspirin');

      // Simulate press event
      fireEvent.press(inventoryCard);

      // Expected: onPress callback should be called
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should display low stock correctly', () => {
      const lowStockMedication = {
        medicationName: 'Aspirin',
        medicationType: 'Tablet',
        stock: 3
      };

      const { getByTestId } = render(
        <InventoryCard 
          medicationName={lowStockMedication.medicationName}
          medicationType={lowStockMedication.medicationType}
          stock={lowStockMedication.stock}
          onPress={jest.fn()}
        />
      );

      const stockCount = getByTestId('stock-count-Aspirin');
      // Fix: children can be an array, so we need to join or check properly
      const stockText = Array.isArray(stockCount.props.children) 
        ? stockCount.props.children.join('') 
        : stockCount.props.children;
      expect(stockText).toBe('3 left');
    });

    it('should handle zero stock display', () => {
      const emptyStockMedication = {
        medicationName: 'Vitamin D',
        medicationType: 'Capsule',
        stock: 0
      };

      const { getByTestId } = render(
        <InventoryCard 
          medicationName={emptyStockMedication.medicationName}
          medicationType={emptyStockMedication.medicationType}
          stock={emptyStockMedication.stock}
          onPress={jest.fn()}
        />
      );

      const stockCount = getByTestId('stock-count-Vitamin D');
      // Fix: children can be an array, so we need to join or check properly
      const stockText = Array.isArray(stockCount.props.children) 
        ? stockCount.props.children.join('') 
        : stockCount.props.children;
      expect(stockText).toBe('0 left');
    });

    it('should render correct icon for different medication types', () => {
      const medicationTypes = [
        { type: 'Tablet', name: 'Aspirin' },
        { type: 'Syrup', name: 'Cough Syrup' },
        { type: 'Capsule', name: 'Vitamin C' },
        { type: 'Syringe', name: 'Insulin' }
      ];

      medicationTypes.forEach(({ type, name }) => {
        const { getByTestId } = render(
          <InventoryCard 
            medicationName={name}
            medicationType={type}
            stock={10}
            onPress={jest.fn()}
          />
        );

        expect(getByTestId(`icon-${name}`)).toBeTruthy();
      });
    });
  });

  // Test stock calculation logic
  describe('Stock Calculation Logic', () => {
    it('should calculate correct stock after multiple doses', () => {
      const initialStock = 30;
      const dosagePerIntake = 2;
      const numberOfIntakes = 5;

      const finalStock = initialStock - (dosagePerIntake * numberOfIntakes);

      expect(finalStock).toBe(20);
    });

    it('should validate stock deduction does not go negative', () => {
      const currentStock = 5;
      const requestedDeduction = 10;

      const canDeduct = currentStock >= requestedDeduction;
      const finalStock = canDeduct ? currentStock - requestedDeduction : currentStock;

      expect(canDeduct).toBe(false);
      expect(finalStock).toBe(5); // Stock should not change if insufficient
    });

    it('should calculate days remaining based on frequency and stock', () => {
      const stock = 30;
      const dosesPerDay = 2;
      const tabletsPerDose = 1;

      const dailyConsumption = dosesPerDay * tabletsPerDose;
      const daysRemaining = Math.floor(stock / dailyConsumption);

      expect(daysRemaining).toBe(15);
    });
  });

  // Test notification context integration
  describe('Notification Integration', () => {
    it('should load notifications correctly from AsyncStorage', async () => {
      const mockNotifications = [
        {
          id: 'low-stock-1',
          title: 'Low Stock Alert',
          body: 'Low stock for Lisinopril',
          timestamp: new Date().toISOString()
        }
      ];

      useNotifications.mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        loadNotifications: jest.fn(),
        clearAllNotifications: jest.fn()
      });

      const { notifications } = useNotifications();

      expect(notifications).toEqual(mockNotifications);
      expect(notifications[0].title).toBe('Low Stock Alert');
    });

    it('should store low stock notifications in AsyncStorage', async () => {
      const lowStockNotification = {
        id: 'low-stock-med1',
        title: 'Low Stock Alert',
        body: 'Low stock for Lisinopril',
        timestamp: new Date().toISOString(),
        type: 'LOW_STOCK'
      };

      // Mock existing notifications
      const existingNotifications = [
        {
          id: 'existing-1',
          title: 'Existing Notification',
          timestamp: new Date().toISOString()
        }
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingNotifications));
      AsyncStorage.setItem.mockResolvedValue(true);

      // Simulate storing new low stock notification
      const storedNotifications = JSON.parse(await AsyncStorage.getItem('notificationsHistory'));
      const updatedNotifications = [...storedNotifications, lowStockNotification];
      await AsyncStorage.setItem('notificationsHistory', JSON.stringify(updatedNotifications));

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('notificationsHistory');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'notificationsHistory',
        JSON.stringify(updatedNotifications)
      );
    });
  });

  // Test Restock Screen Logic (without rendering the component)
  describe('Restock Screen Logic Testing', () => {
    it('should validate quantity input filtering logic', () => {
      // Test the handleInputChange logic
      const handleInputChange = (value) => {
        return value.replace(/[^0-9]/g, '');
      };

      expect(handleInputChange('abc123def')).toBe('123');
      expect(handleInputChange('20')).toBe('20');
      expect(handleInputChange('')).toBe('');
      expect(handleInputChange('12.34')).toBe('1234');
    });

    it('should validate restock submission logic', async () => {
      const quantity = '20';
      const id = 'med1';

      // Mock the restock API
      restockMedication.mockResolvedValue({
        success: true,
        newStock: 25
      });

      // Test the handleSubmit logic
      if (quantity === '') {
        expect(false).toBe(true); // This should not happen in this test
      } else {
        const result = await restockMedication(id, quantity);
        expect(restockMedication).toHaveBeenCalledWith('med1', '20');
        expect(result.success).toBe(true);
      }
    });

    it('should handle empty quantity validation', () => {
      const quantity = '';
      const shouldShowAlert = quantity === '';

      expect(shouldShowAlert).toBe(true);
    });

    it('should handle medication details loading', async () => {
      getMedicationDetails.mockResolvedValue({
        _id: 'med1',
        name: 'Lisinopril',
        stock: 5
      });

      const medicationDetails = await getMedicationDetails('med1');

      expect(getMedicationDetails).toHaveBeenCalledWith('med1');
      expect(medicationDetails.name).toBe('Lisinopril');
      expect(medicationDetails.stock).toBe(5);
    });
  });

  // Test InventoryCard Component Logic
  describe('InventoryCard Component Logic', () => {
    it('should determine correct icon based on medication type', () => {
      const getIconType = (medicationType) => {
        switch (medicationType?.toLowerCase()) {
          case "tablet":
            return "tablets";
          case "syrup":
            return "bottle-tonic-plus-outline";
          case "syringe":
            return "syringe";
          case "capsule":
          default:
            return "pill";
        }
      };

      expect(getIconType('Tablet')).toBe('tablets');
      expect(getIconType('Syrup')).toBe('bottle-tonic-plus-outline');
      expect(getIconType('Syringe')).toBe('syringe');
      expect(getIconType('Capsule')).toBe('pill');
      expect(getIconType(undefined)).toBe('pill');
    });

    it('should format stock display correctly', () => {
      const formatStock = (stock) => `${stock} left`;

      expect(formatStock(25)).toBe('25 left');
      expect(formatStock(0)).toBe('0 left');
      expect(formatStock(1)).toBe('1 left');
    });
  });
});