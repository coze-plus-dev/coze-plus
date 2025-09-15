# 知识库前端工程技术详解

## 📋 概述

前端工程是知识库系统的用户交互界面，采用 React + TypeScript 技术栈，基于 Rush.js monorepo 架构管理。本文档详细介绍组件化设计、状态管理、交互体验等前端技术实现。

## 🏗️ 前端架构设计

### Monorepo 包管理架构

**Rush.js 管理的分层架构**:

```
frontend/packages/data/knowledge/
├── Level 1: 基础层 (common/*)
│   ├── common-components/     # 通用UI组件库
│   ├── common-hooks/         # 通用React Hooks
│   ├── common-services/      # 通用业务服务
│   └── stores/              # 全局状态管理
├── Level 2: 处理层 (knowledge-resource-processor-*)
│   ├── core/                # 核心处理逻辑
│   ├── base/                # 基础处理组件
│   └── adapter/             # 适配器实现
├── Level 3: IDE层 (knowledge-ide-*)
│   ├── base/                # IDE基础框架
│   └── adapter/             # 业务场景适配
└── Level 4: 模态层 (knowledge-modal-*)
    ├── base/                # 弹窗基础组件
    └── adapter/             # 弹窗业务适配
```

### 技术栈选择

| 技术 | 版本 | 用途 | 优势 |
|------|------|------|------|
| **React** | 18+ | UI框架 | Hooks、Concurrent Features |
| **TypeScript** | 5.0+ | 类型系统 | 强类型、IDE支持 |
| **Rush.js** | 5.0+ | Monorepo管理 | 依赖管理、构建优化 |
| **Rsbuild** | 1.0+ | 构建工具 | 基于Rspack、性能优异 |
| **Semi Design** | 2.0+ | UI组件库 | 字节跳动出品、主题定制 |
| **Tailwind CSS** | 3.0+ | 样式框架 | 原子化CSS |
| **Zustand** | 4.0+ | 状态管理 | 轻量级、TypeScript友好 |

## 📦 组件化架构实现

### 组件层次设计

**位置**: `frontend/packages/data/knowledge/`

#### Level 1: 基础组件层

**1. 通用UI组件**
**位置**: `common/components/src/`

```typescript
// 文档预览组件
export interface DocPreviewProps {
  fileType: 'pdf' | 'word' | 'excel' | 'image' | 'text'
  fileUrl: string
  fileName: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export const DocPreview: FC<DocPreviewProps> = ({ 
  fileType, 
  fileUrl, 
  fileName,
  onLoad,
  onError 
}) => {
  const [loading, setLoading] = useState(true)
  
  const renderPreview = () => {
    switch (fileType) {
      case 'pdf':
        return <PDFPreview url={fileUrl} onLoad={onLoad} onError={onError} />
      case 'image':
        return <ImagePreview url={fileUrl} alt={fileName} onLoad={onLoad} />
      case 'text':
        return <TextPreview url={fileUrl} onLoad={onLoad} />
      default:
        return <UnsupportedPreview fileName={fileName} />
    }
  }
  
  return (
    <div className="doc-preview-container">
      {loading && <Skeleton active />}
      {renderPreview()}
    </div>
  )
}

// 文件选择器组件
export interface FilePickerProps {
  accept?: string[]
  multiple?: boolean
  maxSize?: number
  onFilesSelect: (files: File[]) => void
  onError?: (error: string) => void
}

export const FilePicker: FC<FilePickerProps> = ({
  accept = [],
  multiple = false,
  maxSize = 100 * 1024 * 1024, // 100MB
  onFilesSelect,
  onError
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple,
    maxSize,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        onError?.(`文件不符合要求: ${rejectedFiles[0].errors[0].message}`)
        return
      }
      onFilesSelect(acceptedFiles)
    }
  })
  
  return (
    <div 
      {...getRootProps()} 
      className={`file-picker ${isDragActive ? 'drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="file-picker-content">
        <UploadOutlined className="upload-icon" />
        <p>拖拽文件到此处或点击上传</p>
        <p className="file-picker-tip">
          支持 {accept.join(', ')} 格式，最大 {formatFileSize(maxSize)}
        </p>
      </div>
    </div>
  )
}
```

**2. 通用业务Hooks**
**位置**: `common/hooks/src/`

```typescript
// 知识库导航Hook
export const useKnowledgeNavigate = () => {
  const navigate = useNavigate()
  
  const toKnowledgeList = useCallback((spaceId: string) => {
    navigate(`/space/${spaceId}/knowledge`)
  }, [navigate])
  
  const toKnowledgeDetail = useCallback((spaceId: string, knowledgeId: string) => {
    navigate(`/space/${spaceId}/knowledge/${knowledgeId}`)
  }, [navigate])
  
  const toDocumentList = useCallback((spaceId: string, knowledgeId: string) => {
    navigate(`/space/${spaceId}/knowledge/${knowledgeId}/documents`)
  }, [navigate])
  
  return {
    toKnowledgeList,
    toKnowledgeDetail,
    toDocumentList
  }
}

// 知识库列表Hook
export const useKnowledgeList = (params: {
  spaceId: string
  page?: number
  pageSize?: number
  query?: string
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    list: Knowledge[]
    total: number
    hasMore: boolean
  }>({ list: [], total: 0, hasMore: false })
  
  const fetchKnowledgeList = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await knowledgeAPI.listKnowledge({
        spaceId: params.spaceId,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        query: params.query
      })
      
      setData({
        list: response.data.knowledgeList || [],
        total: response.data.total || 0,
        hasMore: (response.data.knowledgeList?.length || 0) < (response.data.total || 0)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取知识库列表失败')
    } finally {
      setLoading(false)
    }
  }, [params])
  
  useEffect(() => {
    fetchKnowledgeList()
  }, [fetchKnowledgeList])
  
  return {
    data,
    loading,
    error,
    refresh: fetchKnowledgeList
  }
}
```

#### Level 2: 资源处理器组件

**核心处理逻辑**
**位置**: `knowledge-resource-processor-core/src/`

```typescript
// 文档处理器上下文
export interface DocumentProcessorContext {
  knowledgeId: string
  documents: UploadDocument[]
  onProgress: (progress: ProcessProgress) => void
  onComplete: (results: ProcessResult[]) => void
  onError: (error: ProcessError) => void
}

export const DocumentProcessorProvider: FC<{
  context: DocumentProcessorContext
  children: ReactNode
}> = ({ context, children }) => {
  const [state, setState] = useState<ProcessorState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    results: []
  })
  
  const processDocuments = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'processing' }))
    
    try {
      for (let i = 0; i < context.documents.length; i++) {
        const doc = context.documents[i]
        
        // 1. 文件上传
        setState(prev => ({ 
          ...prev, 
          currentStep: `上传文件 ${doc.name}`,
          progress: (i / context.documents.length) * 25
        }))
        
        const uploadResult = await uploadDocument(doc)
        
        // 2. 文档解析
        setState(prev => ({ 
          ...prev, 
          currentStep: `解析文档 ${doc.name}`,
          progress: (i / context.documents.length) * 50
        }))
        
        const parseResult = await parseDocument(uploadResult.uri)
        
        // 3. 内容分块
        setState(prev => ({ 
          ...prev, 
          currentStep: `分块处理 ${doc.name}`,
          progress: (i / context.documents.length) * 75
        }))
        
        const chunkResult = await chunkDocument(parseResult)
        
        // 4. 向量化索引
        setState(prev => ({ 
          ...prev, 
          currentStep: `建立索引 ${doc.name}`,
          progress: (i / context.documents.length) * 100
        }))
        
        await indexDocument(chunkResult)
        
        context.onProgress({
          documentName: doc.name,
          progress: 100,
          step: 'completed'
        })
      }
      
      setState(prev => ({ 
        ...prev, 
        status: 'completed',
        progress: 100,
        currentStep: '处理完成'
      }))
      
      context.onComplete(state.results)
    } catch (error) {
      setState(prev => ({ ...prev, status: 'error' }))
      context.onError({
        message: error instanceof Error ? error.message : '处理失败',
        code: 'PROCESS_ERROR'
      })
    }
  }, [context])
  
  return (
    <ProcessorContext.Provider value={{ state, processDocuments }}>
      {children}
    </ProcessorContext.Provider>
  )
}
```

#### Level 3: IDE框架组件

**知识库IDE基础框架**
**位置**: `knowledge-ide-base/src/layout/`

```typescript
// IDE布局组件
export interface KnowledgeIDELayoutProps {
  knowledgeId: string
  children: ReactNode
  sidebarContent?: ReactNode
  headerExtra?: ReactNode
}

export const KnowledgeIDELayout: FC<KnowledgeIDELayoutProps> = ({
  knowledgeId,
  children,
  sidebarContent,
  headerExtra
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { data: knowledge } = useKnowledge(knowledgeId)
  
  return (
    <Layout className="knowledge-ide-layout">
      {/* 顶部导航栏 */}
      <Layout.Header className="ide-header">
        <div className="header-left">
          <Breadcrumb>
            <Breadcrumb.Item>知识库</Breadcrumb.Item>
            <Breadcrumb.Item>{knowledge?.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="header-right">
          {headerExtra}
        </div>
      </Layout.Header>
      
      <Layout className="ide-content">
        {/* 左侧边栏 */}
        <Layout.Sider 
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          className="ide-sidebar"
        >
          {sidebarContent || <DefaultSidebar knowledgeId={knowledgeId} />}
        </Layout.Sider>
        
        {/* 主内容区 */}
        <Layout.Content className="ide-main">
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

// 默认侧边栏
const DefaultSidebar: FC<{ knowledgeId: string }> = ({ knowledgeId }) => {
  const navigate = useKnowledgeNavigate()
  
  const menuItems = [
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: '文档管理',
      onClick: () => navigate.toDocumentList(knowledgeId)
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: '搜索测试',
      onClick: () => navigate.toSearchTest(knowledgeId)
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '知识库设置',
      onClick: () => navigate.toKnowledgeSettings(knowledgeId)
    }
  ]
  
  return <Menu items={menuItems} />
}
```

## 🗃️ 状态管理实现

### Zustand 状态架构

**位置**: `common/stores/src/`

```typescript
// 知识库状态管理
interface KnowledgeStore {
  // 状态
  knowledgeList: Knowledge[]
  currentKnowledge: Knowledge | null
  loading: boolean
  error: string | null
  
  // 操作
  fetchKnowledgeList: (params: ListKnowledgeParams) => Promise<void>
  createKnowledge: (params: CreateKnowledgeParams) => Promise<Knowledge>
  updateKnowledge: (id: string, params: UpdateKnowledgeParams) => Promise<void>
  deleteKnowledge: (id: string) => Promise<void>
  setCurrentKnowledge: (knowledge: Knowledge | null) => void
  
  // 重置
  reset: () => void
}

export const useKnowledgeStore = create<KnowledgeStore>((set, get) => ({
  // 初始状态
  knowledgeList: [],
  currentKnowledge: null,
  loading: false,
  error: null,
  
  // 获取知识库列表
  fetchKnowledgeList: async (params) => {
    set({ loading: true, error: null })
    
    try {
      const response = await knowledgeAPI.listKnowledge(params)
      set({ 
        knowledgeList: response.data.knowledgeList || [],
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取失败',
        loading: false 
      })
    }
  },
  
  // 创建知识库
  createKnowledge: async (params) => {
    set({ loading: true, error: null })
    
    try {
      const response = await knowledgeAPI.createKnowledge(params)
      const newKnowledge = response.data
      
      set(state => ({
        knowledgeList: [newKnowledge, ...state.knowledgeList],
        loading: false
      }))
      
      return newKnowledge
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建失败',
        loading: false 
      })
      throw error
    }
  },
  
  // 更新知识库
  updateKnowledge: async (id, params) => {
    try {
      await knowledgeAPI.updateKnowledge(id, params)
      
      set(state => ({
        knowledgeList: state.knowledgeList.map(k => 
          k.id === id ? { ...k, ...params } : k
        ),
        currentKnowledge: state.currentKnowledge?.id === id 
          ? { ...state.currentKnowledge, ...params }
          : state.currentKnowledge
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新失败' })
      throw error
    }
  },
  
  // 设置当前知识库
  setCurrentKnowledge: (knowledge) => {
    set({ currentKnowledge: knowledge })
  },
  
  // 重置状态
  reset: () => {
    set({
      knowledgeList: [],
      currentKnowledge: null,
      loading: false,
      error: null
    })
  }
}))

// 文档处理状态管理
interface ProcessingStore {
  // 处理中的文档
  processingDocuments: Map<string, DocumentProcessing>
  
  // 操作
  addProcessingDocument: (doc: DocumentProcessing) => void
  updateProcessingDocument: (id: string, update: Partial<DocumentProcessing>) => void
  removeProcessingDocument: (id: string) => void
  
  // 查询
  getProcessingDocument: (id: string) => DocumentProcessing | undefined
  getAllProcessingDocuments: () => DocumentProcessing[]
}

export const useProcessingStore = create<ProcessingStore>((set, get) => ({
  processingDocuments: new Map(),
  
  addProcessingDocument: (doc) => {
    set(state => ({
      processingDocuments: new Map(state.processingDocuments).set(doc.id, doc)
    }))
  },
  
  updateProcessingDocument: (id, update) => {
    set(state => {
      const doc = state.processingDocuments.get(id)
      if (!doc) return state
      
      const updatedDoc = { ...doc, ...update }
      return {
        processingDocuments: new Map(state.processingDocuments).set(id, updatedDoc)
      }
    })
  },
  
  removeProcessingDocument: (id) => {
    set(state => {
      const newMap = new Map(state.processingDocuments)
      newMap.delete(id)
      return { processingDocuments: newMap }
    })
  },
  
  getProcessingDocument: (id) => {
    return get().processingDocuments.get(id)
  },
  
  getAllProcessingDocuments: () => {
    return Array.from(get().processingDocuments.values())
  }
}))
```

### 状态持久化

```typescript
// 本地存储持久化
import { subscribeWithSelector } from 'zustand/middleware'
import { persist } from 'zustand/middleware'

export const useKnowledgeStore = create<KnowledgeStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // ... store implementation
    })),
    {
      name: 'knowledge-store',
      storage: createJSONStorage(() => localStorage),
      
      // 选择性持久化
      partialize: (state) => ({
        currentKnowledge: state.currentKnowledge,
        // 不持久化敏感数据和临时状态
      }),
      
      // 版本管理
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          // 迁移逻辑
        }
        return persistedState as KnowledgeStore
      }
    }
  )
)
```

## 🎨 交互设计实现

### 文档上传体验

```typescript
// 拖拽上传组件
export const DragDropUploader: FC<{
  onFilesUpload: (files: File[]) => void
  accept?: string[]
  maxSize?: number
  multiple?: boolean
}> = ({ onFilesUpload, accept, maxSize, multiple }) => {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Map<string, number>>(new Map())
  
  const handleDrop = useCallback(async (files: File[]) => {
    setUploading(true)
    
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      
      return axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          )
          setProgress(prev => new Map(prev).set(file.name, percent))
        }
      })
    })
    
    try {
      await Promise.all(uploadPromises)
      message.success('上传完成')
      onFilesUpload(files)
    } catch (error) {
      message.error('上传失败')
    } finally {
      setUploading(false)
      setProgress(new Map())
    }
  }, [onFilesUpload])
  
  return (
    <div 
      className={`drag-drop-uploader ${dragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const files = Array.from(e.dataTransfer.files)
        handleDrop(files)
      }}
    >
      {uploading ? (
        <div className="upload-progress">
          {Array.from(progress.entries()).map(([name, percent]) => (
            <div key={name} className="file-progress">
              <span>{name}</span>
              <Progress percent={percent} size="small" />
            </div>
          ))}
        </div>
      ) : (
        <div className="upload-placeholder">
          <CloudUploadOutlined className="upload-icon" />
          <p>拖拽文件到此处上传</p>
          <p className="upload-hint">
            或 <Button type="link">点击选择文件</Button>
          </p>
        </div>
      )}
    </div>
  )
}
```

### 实时进度显示

```typescript
// WebSocket 进度监听
export const useDocumentProgress = (documentIds: string[]) => {
  const [progress, setProgress] = useState<Map<string, DocumentProgress>>(new Map())
  const ws = useRef<WebSocket | null>(null)
  
  useEffect(() => {
    if (documentIds.length === 0) return
    
    // 建立WebSocket连接
    ws.current = new WebSocket(`/ws/document-progress`)
    
    ws.current.onopen = () => {
      // 订阅文档进度
      ws.current?.send(JSON.stringify({
        type: 'subscribe',
        documentIds
      }))
    }
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data) as ProgressUpdate
      
      setProgress(prev => new Map(prev).set(data.documentId, {
        id: data.documentId,
        progress: data.progress,
        status: data.status,
        message: data.message,
        estimatedTime: data.estimatedTime
      }))
    }
    
    return () => {
      ws.current?.close()
    }
  }, [documentIds])
  
  return progress
}

// 进度显示组件
export const DocumentProgressList: FC<{
  documentIds: string[]
}> = ({ documentIds }) => {
  const progress = useDocumentProgress(documentIds)
  
  return (
    <div className="document-progress-list">
      {Array.from(progress.values()).map((item) => (
        <div key={item.id} className="progress-item">
          <div className="progress-header">
            <span className="document-name">{item.name}</span>
            <span className="progress-percent">{item.progress}%</span>
          </div>
          
          <Progress 
            percent={item.progress}
            status={item.status === 'failed' ? 'exception' : 'active'}
            strokeColor={getProgressColor(item.status)}
          />
          
          <div className="progress-info">
            <span className="status-message">{item.message}</span>
            {item.estimatedTime && (
              <span className="estimated-time">
                预计剩余: {formatTime(item.estimatedTime)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 智能搜索体验

```typescript
// 搜索输入组件
export const KnowledgeSearch: FC<{
  knowledgeId: string
  onResults: (results: SearchResult[]) => void
}> = ({ knowledgeId, onResults }) => {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const debouncedQuery = useDebounce(query, 300)
  
  // 搜索建议
  useEffect(() => {
    if (debouncedQuery.length > 2) {
      searchAPI.getSuggestions(knowledgeId, debouncedQuery)
        .then(response => setSuggestions(response.data))
        .catch(() => setSuggestions([]))
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, knowledgeId])
  
  // 执行搜索
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      const response = await searchAPI.searchKnowledge({
        knowledgeId,
        query: searchQuery,
        topK: 20
      })
      
      onResults(response.data.results || [])
    } catch (error) {
      message.error('搜索失败')
    } finally {
      setSearching(false)
    }
  }, [knowledgeId, onResults])
  
  return (
    <div className="knowledge-search">
      <AutoComplete
        value={query}
        onChange={setQuery}
        onSelect={handleSearch}
        options={suggestions.map(s => ({ value: s }))}
        placeholder="搜索知识库内容..."
        style={{ width: '100%' }}
      >
        <Input.Search
          loading={searching}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
        />
      </AutoComplete>
    </div>
  )
}

// 搜索结果高亮
export const SearchResultItem: FC<{
  result: SearchResult
  query: string
}> = ({ result, query }) => {
  const highlightText = useCallback((text: string, query: string) => {
    if (!query) return text
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    )
  }, [])
  
  return (
    <div className="search-result-item">
      <div className="result-header">
        <h4 className="result-title">
          {highlightText(result.title, query)}
        </h4>
        <div className="result-meta">
          <span className="result-score">
            相关度: {(result.score * 100).toFixed(1)}%
          </span>
          <span className="result-source">{result.source}</span>
        </div>
      </div>
      
      <div className="result-content">
        {highlightText(result.content, query)}
      </div>
      
      <div className="result-actions">
        <Button size="small" type="link">
          查看详情
        </Button>
        <Button size="small" type="link">
          查看原文档
        </Button>
      </div>
    </div>
  )
}
```

## 🛠️ 构建和开发工具

### Rsbuild 配置

**位置**: `rsbuild.config.ts`

```typescript
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'
import { pluginLess } from '@rsbuild/plugin-less'

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginTypeCheck(),
    pluginLess()
  ],
  
  // 开发服务器配置
  dev: {
    assetPrefix: '/',
    hmr: true,
    liveReload: true
  },
  
  // 构建优化
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
      override: {
        chunks: {
          'vendor-react': {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'vendor-react',
            chunks: 'all'
          },
          'vendor-antd': {
            test: /[\\/]node_modules[\\/](@douyinfe[\\/]semi|antd)[\\/]/,
            name: 'vendor-ui',
            chunks: 'all'
          }
        }
      }
    }
  },
  
  // 源码映射
  output: {
    sourceMap: {
      js: process.env.NODE_ENV === 'development' ? 'cheap-module-source-map' : false
    }
  },
  
  // 别名配置
  source: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@utils': './src/utils',
      '@hooks': './src/hooks',
      '@stores': './src/stores'
    }
  }
})
```

### Rush.js 配置

**位置**: `rush.json`

```json
{
  "rushVersion": "5.112.2",
  "pnpmVersion": "8.15.6",
  
  "projects": [
    {
      "packageName": "@coze-data/knowledge-common-components",
      "projectFolder": "packages/data/knowledge/common/components",
      "reviewCategory": "libraries"
    },
    {
      "packageName": "@coze-data/knowledge-common-hooks", 
      "projectFolder": "packages/data/knowledge/common/hooks",
      "reviewCategory": "libraries"
    },
    {
      "packageName": "@coze-data/knowledge-stores",
      "projectFolder": "packages/data/knowledge/common/stores", 
      "reviewCategory": "libraries"
    }
  ],
  
  "gitPolicy": {
    "allowedEmailRegExps": [".*@coze\\.com$"],
    "sampleEmail": "developer@coze.com"
  },
  
  "repository": {
    "url": "https://github.com/coze-dev/coze-studio.git",
    "defaultBranch": "main"
  }
}
```

## 🧪 测试策略

### 单元测试

**Vitest 配置位置**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

**组件测试示例**:

```typescript
// KnowledgeList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { KnowledgeList } from '../KnowledgeList'
import { knowledgeAPI } from '@/api'

vi.mock('@/api')

describe('KnowledgeList', () => {
  beforeEach(() => {
    vi.mocked(knowledgeAPI.listKnowledge).mockResolvedValue({
      data: {
        knowledgeList: [
          { id: '1', name: '测试知识库1', description: '描述1' },
          { id: '2', name: '测试知识库2', description: '描述2' }
        ],
        total: 2
      }
    })
  })
  
  test('renders knowledge list correctly', async () => {
    render(<KnowledgeList spaceId="space1" />)
    
    await waitFor(() => {
      expect(screen.getByText('测试知识库1')).toBeInTheDocument()
      expect(screen.getByText('测试知识库2')).toBeInTheDocument()
    })
  })
  
  test('handles search input', async () => {
    render(<KnowledgeList spaceId="space1" />)
    
    const searchInput = screen.getByPlaceholderText('搜索知识库')
    fireEvent.change(searchInput, { target: { value: '测试' } })
    
    await waitFor(() => {
      expect(knowledgeAPI.listKnowledge).toHaveBeenCalledWith({
        spaceId: 'space1',
        query: '测试'
      })
    })
  })
})
```

### 集成测试

```typescript
// knowledge-integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { KnowledgeWorkspace } from '../KnowledgeWorkspace'
import { TestProvider } from '@/test/providers'

describe('Knowledge Integration', () => {
  test('complete knowledge creation workflow', async () => {
    render(
      <TestProvider>
        <KnowledgeWorkspace />
      </TestProvider>
    )
    
    // 1. 点击创建知识库
    fireEvent.click(screen.getByText('创建知识库'))
    
    // 2. 填写表单
    fireEvent.change(screen.getByLabelText('知识库名称'), {
      target: { value: '新知识库' }
    })
    
    // 3. 上传文档
    const fileInput = screen.getByTestId('file-input')
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // 4. 提交创建
    fireEvent.click(screen.getByText('创建'))
    
    // 5. 验证创建成功
    await waitFor(() => {
      expect(screen.getByText('知识库创建成功')).toBeInTheDocument()
    })
  })
})
```

## 📊 性能优化

### 组件优化策略

```typescript
// 虚拟滚动优化
import { FixedSizeList as List } from 'react-window'

export const VirtualizedKnowledgeList: FC<{
  items: Knowledge[]
  onItemClick: (item: Knowledge) => void
}> = ({ items, onItemClick }) => {
  const Row = useCallback(({ index, style }: { index: number, style: CSSProperties }) => (
    <div style={style}>
      <KnowledgeListItem 
        knowledge={items[index]}
        onClick={onItemClick}
      />
    </div>
  ), [items, onItemClick])
  
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={80}
      itemData={items}
    >
      {Row}
    </List>
  )
}

// 图片懒加载
export const LazyImage: FC<{
  src: string
  alt: string
  className?: string
}> = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    
    if (imgRef.current) {
      observer.observe(imgRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <div ref={imgRef} className={className}>
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
    </div>
  )
}
```

### 代码分割策略

```typescript
// 路由级别代码分割
const KnowledgeListPage = lazy(() => import('./pages/KnowledgeListPage'))
const KnowledgeDetailPage = lazy(() => import('./pages/KnowledgeDetailPage'))
const DocumentListPage = lazy(() => import('./pages/DocumentListPage'))

export const KnowledgeRoutes = () => (
  <Routes>
    <Route path="/knowledge" element={
      <Suspense fallback={<PageSkeleton />}>
        <KnowledgeListPage />
      </Suspense>
    } />
    <Route path="/knowledge/:id" element={
      <Suspense fallback={<PageSkeleton />}>
        <KnowledgeDetailPage />
      </Suspense>
    } />
    <Route path="/knowledge/:id/documents" element={
      <Suspense fallback={<PageSkeleton />}>
        <DocumentListPage />
      </Suspense>
    } />
  </Routes>
)

// 组件级别代码分割
const HeavyChart = lazy(() => import('./HeavyChart'))

export const Dashboard = () => {
  const [showChart, setShowChart] = useState(false)
  
  return (
    <div>
      <Button onClick={() => setShowChart(true)}>
        显示图表
      </Button>
      
      {showChart && (
        <Suspense fallback={<Spin />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  )
}
```

---

**文档版本**: v1.0  
**最后更新**: 2025-01-11  
**相关文档**: [知识库架构总览](./knowledge-base-architecture.md)