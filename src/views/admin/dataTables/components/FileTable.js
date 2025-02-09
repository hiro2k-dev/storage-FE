import {
  Flex,
  Box,
  Table,
  Checkbox,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Button,
  Spinner,
} from '@chakra-ui/react';
import * as React from 'react';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import Card from 'components/card/Card';
import Menu from 'components/menu/MainMenu';
import { formatFileSize } from 'utils';
import { RiFolderDownloadFill } from 'react-icons/ri';
import { MdDelete } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL;
const CHUNK_SIZE = 1024 * 256; // 256KB per chunk
const columnHelper = createColumnHelper();

export default function FileTable(props) {
  const { tableData, dataQuery } = props;
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const fileInputRef = React.useRef(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState({});
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  let defaultData = tableData;

  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          NAME
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Checkbox colorScheme="brandScheme" me="10px" />
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('size', {
      id: 'size',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          SIZE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {formatFileSize(info.getValue())}
        </Text>
      ),
    }),
    columnHelper.accessor('updatedAt', {
      id: 'updatedAt',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          LAST UPDATE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('', {
      id: 'action',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400"></Text>
      ),
      cell: (info) => (
        <Box display="flex" flexDirection="row" justifyContent="flex-end">
          <Button isDisabled={info.row.original?.isFolder}>
            <RiFolderDownloadFill size="24px" />
          </Button>
          <Button isDisabled={info.row.original?.isFolder}>
            <MdDelete color="red" size="24px" />
          </Button>
        </Box>
      ),
    }),
  ];

  const [data, setData] = React.useState(tableData);
  React.useEffect(() => {
    setData(tableData);
  }, [tableData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // 🔥 Open file selection dialog
  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  // 📤 Handle File Selection & Start Upload
  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setSelectedFiles(files);
    handleUpload(files);
  };

  // 📤 Upload Files
  const handleUpload = async (files) => {
    setIsUploading(true);
    let progress = {};

    for (const file of files) {
      const relativePath = file.webkitRelativePath || file.name;
      progress[relativePath] = 0;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('filename', relativePath);
        formData.append('chunkIndex', i);
        formData.append('totalChunks', totalChunks);

        await axios.post(`${API_URL}/upload`, formData, {
          onUploadProgress: (progressEvent) => {
            progress[relativePath] = ((i + 1) / totalChunks) * 100;
            setUploadProgress({ ...progress });
          },
        });
      }

      await axios.post(`${API_URL}/merge`, {
        filename: relativePath,
        totalChunks,
      });
    }

    toast.success('✅ Upload complete!');
    setUploadProgress({});
    setIsUploading(false);
    dataQuery.refetch(); // Refresh file list after upload
  };

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX={{ sm: 'scroll', lg: 'hidden' }}
    >
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        {/* ✅ Hidden File Input */}
        <input
          type="file"
          multiple
          // webkitdirectory="true"
          // directory="true"
          style={{ display: 'none' }} // Hide input
          ref={fileInputRef}
          onChange={handleFileSelection}
        />

        {/* ✅ Upload Button (Triggers File Selection) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            // onClick={openFileSelector}
            variant="solid"
            bg="orange.500"
            color="#FFF"
          >
            NEW FOLDER
          </Button>
          <Button
            onClick={openFileSelector}
            variant="solid"
            bg="brand.500"
            color="#FFF"
          >
            UPLOAD
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {dataQuery.isFetching && <Spinner size="sm" />}
          <Menu />
        </Box>
      </Flex>
      <Box>
        <Table variant="simple" color="gray.500" mb="24px" mt="12px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    borderColor={borderColor}
                    cursor="pointer"
                  >
                    <Flex justifyContent="space-between" align="center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id} borderColor="transparent">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
}
