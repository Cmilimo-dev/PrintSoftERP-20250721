
import { getBasePrintStyles } from './styles/basePrintStyles';
import { getHeaderStyles } from './styles/headerStyles';
import { getVendorStyles } from './styles/vendorStyles';
import { getTableStyles } from './styles/tableStyles';
import { getTotalsStyles } from './styles/totalsStyles';
import { getLayoutStyles } from './styles/layoutStyles';
import { getPrintMediaQueries } from './styles/printMediaQueries';

export const getPrintStyles = () => `
  ${getBasePrintStyles()}
  ${getHeaderStyles()}
  ${getVendorStyles()}
  ${getTableStyles()}
  ${getTotalsStyles()}
  ${getLayoutStyles()}
  ${getPrintMediaQueries()}
`;
