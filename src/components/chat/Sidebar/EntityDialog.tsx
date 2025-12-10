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

const EntityDialog = ({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { getDatasets, getCollections, addAgent } = useDatasetActions()
  const [datasets, setDatasets] = useState<any[]>([])
  const [selectedDataset, setSelectedDataset] = useState<any>()

  const [collections, setCollections] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<any>()

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
      setSelectedCollection(undefined)
    }
  }, [open])

  useEffect(() => {
    if (!!(name || selectedDataset || selectedCollection)) {
      setDisplayErrorMessage('')
    }
  }, [name, selectedDataset, selectedCollection])

  useEffect(() => {
    if (selectedDataset) {
      fetchCollections(selectedDataset)
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
      errorMessage = 'Name is required'
    }
    if (!selectedDataset) {
      errorMessage = 'Dataset is required'
    }
    if (!selectedCollection) {
      errorMessage = 'Collection is required'
    }

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
          collection_id: selectedCollection,
          agent_db_file: 'data/agents.db',
          session_table: 'deep_knowledge_sessions'
        }
      })
      if (result?.task_id) {
        toast.success('Agent added successfully')
        onOpenChange(false)
      }
    } catch (error) {
      setDisplayErrorMessage('Error adding agent')
    } finally {
      setIsLoading(false)
    }
  }

  const renderDatasetSelect = () => {
    return (
      <Select value={selectedDataset} onValueChange={setSelectedDataset}>
        <SelectTrigger className="border-primary/15 bg-primaryAccent h-9 w-full rounded-xl border text-xs font-medium uppercase outline-none">
          <SelectValue placeholder="Select a dataset" />
        </SelectTrigger>
        <SelectContent className="bg-primaryAccent font-dmmono border-none shadow-lg">
          {datasets?.map((dataset, index) => (
            <SelectItem
              className="cursor-pointer"
              key={`${dataset.id}-${index}`}
              value={dataset.id}
            >
              <div className="flex items-center gap-3 text-xs font-medium uppercase">
                {dataset.name || dataset.id}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const renderCollectionSelect = () => {
    return (
      <Select value={selectedCollection} onValueChange={setSelectedCollection}>
        <SelectTrigger className="border-primary/15 bg-primaryAccent h-9 w-full rounded-xl border text-xs font-medium uppercase">
          <SelectValue placeholder="Select a collection" />
        </SelectTrigger>
        <SelectContent className="bg-primaryAccent font-dmmono border-none shadow-lg">
          {collections?.map((collection, index) => (
            <SelectItem
              className="cursor-pointer"
              key={`${collection.id}-${index}`}
              value={collection.id}
            >
              <div className="flex items-center gap-3 text-xs font-medium uppercase">
                {collection.name || collection.id}
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
          <p className="mb-2 text-xs font-medium uppercase">Dataset</p>
          {renderDatasetSelect()}
        </div>
        {selectedDataset && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase">Collection</p>
            {renderCollectionSelect()}
          </div>
        )}
        <div>
          <p className="mb-2 text-xs font-medium uppercase">Name</p>
          <input
            type="text"
            value={name}
            placeholder="Enter a name"
            onChange={(e) => setName(e.target.value)}
            className="border-primary/15 bg-accent text-muted flex h-9 w-full items-center text-ellipsis rounded-xl border p-3 text-xs font-medium"
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
            Add Agent{' '}
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
            CANCEL
          </Button>
          <Button
            variant="destructive"
            className="font-geist rounded-xl"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'SAVE'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EntityDialog
