import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardCheck,
  ChevronRight,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';

const DataGridExportContextMenu = ({
  open,
  position,
  onClose,
  onCopy,
  onCopyCell,
  onCopyRow,
  onRefresh,
  onExport,
}) => {
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);

  useEffect(() => {
    if (!open) {
      setExportMenuAnchorEl(null);
    }
  }, [open]);

  const anchorPosition = useMemo(() => {
    if (!position) {
      return undefined;
    }

    return {
      top: position.mouseY,
      left: position.mouseX,
    };
  }, [position]);

  const handleExportMenuOpen = (event) => {
    setExportMenuAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchorEl(null);
  };

  const handleExportClick = async (format) => {
    handleExportMenuClose();
    onClose();
    await onExport(format);
  };

  return (
    <>
      <Menu
        open={open}
        onClose={onClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              minWidth: 220,
              borderRadius: 1.5,
            },
          },
        }}
      >
        <MenuItem onClick={onCopy}>
          <ListItemIcon>
            <ClipboardCheck className="w-4 h-4" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>

        <MenuItem onClick={onCopyCell}>
          <ListItemIcon>
            <Eye className="w-4 h-4" />
          </ListItemIcon>
          <ListItemText>Copy Cell</ListItemText>
        </MenuItem>

        <MenuItem onClick={onCopyRow}>
          <ListItemIcon>
            <MapPin className="w-4 h-4" />
          </ListItemIcon>
          <ListItemText>Copy Row</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleExportMenuOpen}>
          <ListItemIcon>
            <ShieldCheck className="w-4 h-4" />
          </ListItemIcon>
          <ListItemText>Export Dataset</ListItemText>
          <ChevronRight className="w-4 h-4" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={onRefresh}>
          <ListItemIcon>
            <RefreshCw className="w-4 h-4" />
          </ListItemIcon>
          <ListItemText>Refresh</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        open={Boolean(exportMenuAnchorEl)}
        onClose={handleExportMenuClose}
        anchorEl={exportMenuAnchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleExportClick('excel')}>
          <ListItemIcon>
            <CreditCard className="w-4 h-4" />
          </ListItemIcon>
          <ListItemText>Export to Excel (.xlsx)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('csv')}>
          <ListItemIcon>
            <FileText className="w-4 h-4" />
          </ListItemIcon>
          <ListItemText>Export to CSV (.csv)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExportClick('pdf')}>
          <ListItemIcon>
            <FileText className="w-4 h-4" />
          </ListItemIcon>
          <ListItemText>Export to PDF (.pdf)</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default DataGridExportContextMenu;
