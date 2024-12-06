import { Add } from '@carbon/react/icons';

import { getRowAction } from './tableUtilities';

describe('statefulTableUtilities', () => {
  describe('getRowAction', () => {
    it('it should traverse the children looking for the action', () => {
      // this is a very contrived example that _may_ not even be possible within
      // the table, but I didn't want to remove the code just in case there's an edge
      // case of which I'm unaware.
      const data = [
        {
          id: 'row-0',
          values: { string: 'row-0' },
          rowActions: [],
          children: [
            {
              id: 'row-0',
              values: { string: 'test string 0 A' },
              rowActions: [
                {
                  id: 'Add',
                  renderIcon: Add,
                  iconDescription: 'Add',
                  labelText: 'Add',
                },
              ],
            },
            { id: 'row-0_A', values: { string: 'test string 0 C' } },
          ],
        },
      ];

      expect(getRowAction(data, 'Add', 'row-0')).toEqual({
        id: 'Add',
        renderIcon: expect.anything(),
        iconDescription: 'Add',
        labelText: 'Add',
      });
    });

    it("it should return undefined if it isn't found in the children either", () => {
      // this is a very contrived example that _may_ not even be possible within
      // the table, but I didn't want to remove the code just in case there's an edge
      // case of which I'm unaware.
      const data = [
        {
          id: 'row-0',
          values: { string: 'row-0' },
          rowActions: [],
          children: [
            {
              id: 'row-0',
              values: { string: 'test string 0 A' },
              rowActions: [
                {
                  id: '',
                  renderIcon: Add,
                  iconDescription: 'Add',
                  labelText: 'Add',
                },
              ],
            },
            { id: 'row-0_A', values: { string: 'test string 0 C' } },
          ],
        },
      ];

      expect(getRowAction(data, 'Add', 'row-0')).toEqual(undefined);
    });
  });
});
