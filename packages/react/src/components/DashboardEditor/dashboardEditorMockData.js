import { isTimeBasedCard } from '../../utils/cardUtilityFunctions';

export const dataSeriesFormActions = {
  hasAggregationsDropDown: jest.fn(
    (editDataItem) =>
      editDataItem?.dataItemType !== 'DIMENSION' && editDataItem?.type !== 'TIMESTAMP'
  ),
  hasGrainsDropDown: jest.fn(
    (cardConfig, dataItem) =>
      isTimeBasedCard(cardConfig) &&
      dataItem.aggregationMethod &&
      dataItem.aggregationMethod !== 'none'
  ),
  hasDataFilterDropdown: jest.fn(),
};

export const dashboardEditorActions = {
  actions: {
    onEditDataItem: jest.fn().mockImplementation(() => []),
    dataSeriesFormActions,
  },
};
