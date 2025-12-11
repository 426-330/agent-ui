import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import useDatasetActions from '@/hooks/useDatasetActions'
import useChatActions from '@/hooks/useChatActions'

const EntityDialog = ({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { getAgents } = useChatActions()
  const { getDatasets, getCollections, addAgent } = useDatasetActions()
  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDataset, setSelectedDataset] = useState<any>()

  const [collections, setCollections] = useState<any[]>([])

  const [name, setName] = useState<string>('')
  const [displayErrorMessage, setDisplayErrorMessage] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      fetchDatasets()
    } else {
      setName('')
      setDisplayErrorMessage('')
      setSelectedDataset(undefined)
    }
  }, [open])

  useEffect(() => {
    if (!!(name || selectedDataset)) {
      setDisplayErrorMessage('')
    }
  }, [name, selectedDataset])

  useEffect(() => {
    if (selectedDataset) {
      // fetchCollections(selectedDataset)
    }
  }, [selectedDataset])

  const fetchDatasets = async () => {
    const result = await getDatasets()
    setDatasets(result)
  }

  const fetchCollections = async (datasetId: string) => {
    const result = await getCollections(datasetId)
    setCollections(result)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSave = async () => {
    let errorMessage = ''
    if (!name) {
      errorMessage = '名称是必填项'
    }
    if (!selectedDataset) {
      errorMessage = '数据集是必填项'
    }
    // if (!selectedCollection) {
    //   errorMessage = '数据集合是必填项'
    // }

    if (errorMessage) {
      setDisplayErrorMessage(errorMessage)
      return
    }

    try {
      setIsLoading(true)
      const result = await addAgent({
        user_id: '1',
        config: {
          name,
          role: 'agent',
          dataset_id: selectedDataset,
          // collection_id: selectedCollection,
          agent_db_file: 'data/agents.db',
          session_table: 'deep_knowledge_sessions'
        }
      })
      if (result?.task_id) {
        toast.success('智能体添加成功')
        onOpenChange(false)
        getAgents()
      }
    } catch (error) {
      setDisplayErrorMessage('添加智能体失败')
    } finally {
      setIsLoading(false)
    }
  }

  const renderDatasetSelect = () => {
    return (
      <Select value={selectedDataset} onValueChange={setSelectedDataset}>
        <SelectTrigger className="h-9 w-full rounded-xl border bg-gray-100 font-medium">
          <SelectValue placeholder="请选择数据集" />
        </SelectTrigger>
        <SelectContent className="font-dmmono border-none bg-gray-100 shadow-lg">
          {datasets?.map((dataset, index) => (
            <SelectItem
              className="cursor-pointer"
              key={`${dataset.id}-${index}`}
              value={dataset.id}
            >
              <div className="flex items-center gap-3 text-xs font-medium">
                {dataset.name || dataset.id}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const renderForm = () => {
    return (
      <section className="my-4">
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase">知识库</p>
          {renderDatasetSelect()}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase">名称</p>
          <input
            type="text"
            value={name}
            placeholder="请输入名称"
            onChange={(e) => setName(e.target.value)}
            className="flex h-9 w-full items-center text-ellipsis rounded-xl border bg-gray-100 p-3 text-xs font-medium"
          />
        </div>
      </section>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>
            添加智能体{' '}
            {displayErrorMessage && (
              <span className="text-destructive pl-2 text-xs font-medium">
                {displayErrorMessage}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="px-1 py-2">{renderForm()}</div>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-border font-geist rounded-xl"
            onClick={handleClose}
          >
            取消
          </Button>
          <Button
            variant="outline"
            className="font-geist rounded-xl"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EntityDialog
