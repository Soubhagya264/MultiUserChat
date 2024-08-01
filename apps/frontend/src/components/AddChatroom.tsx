import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "@mantine/form";
import { MdClose, MdCheckCircle } from "react-icons/md";
import { CREATE_CHATROOM } from "../graphql/mutations/CreateChatrooms";
import {
  AddUsersToChatroomMutation,
  Chatroom,
  CreateChatroomMutation,
  SearchUsersQuery,
} from "../gql/graphql";

import { useGeneralStore } from "../stores/generalStores";
import { useMutation, useQuery } from "@apollo/client";
import { SEARCH_USERS } from "../graphql/queries/SearchUsers";
import { ADD_USERS_TO_CHATROOM } from "../graphql/mutations/AddUsersToChatroom";
import TextInput from "./Utils/TextInput";
import MultiSelect from "./Utils/MultiSelect";
import { UseFormReturnType } from '@mantine/form';

interface StepOneProps {
  form: UseFormReturnType<{ name: string }, (values: { name: string }) => { name: string }>;
  handleCreateChatroom: () => void;
}
const StepOne: React.FC<StepOneProps> = ({ form, handleCreateChatroom }) => (
  <div>
    <p className="text-sm font-bold mb-4 text-gray-600">Create Chatroom</p>
    <form onSubmit={form.onSubmit(() => handleCreateChatroom())}>
      <TextInput
        placeholder="Chatroom Name"
        label="Chatroom Name"
        error={form.errors.name}
        {...form.getInputProps("name")}
      />
      {form.values.name && (
        <button
          className="mt-3 bg-green-400"
          type="submit"
          onClick={() => handleCreateChatroom()}
        >
          Create Room
        </button>
      )}
    </form>
  </div>
);
interface SelectItem {
  value: string;
  label: string;
}

interface StepTwoProps {
  selectItems: SelectItem[];
  handleSearchChange: (term: string) => void;
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
}
const StepTwo: React.FC<StepTwoProps> = ({
  selectItems,
  setSelectedUsers,
  handleSearchChange
}) => (
  <div>
    <p className="text-sm font-bold mb-4 text-gray-600">Add Users</p>
    <MultiSelect
      data={selectItems}
      label="Choose the members you want to add"
      placeholder="Pick all the users you want to add to this chatroom"
      onChange={setSelectedUsers}
      handleSearchChange={handleSearchChange}
    />
  </div>
);

interface StepThreeProps {
  handleAddUsersToChatroom: () => void;
  loading: boolean;
  selectedUsers: string[];
}

const StepThree: React.FC<StepThreeProps> = ({ handleAddUsersToChatroom, selectedUsers, loading }) => (

  <div>
    <p className="text-sm font-bold mb-4 text-gray-600">Complete</p>
    {selectedUsers.length > 0 && (
      <button
        onClick={handleAddUsersToChatroom}
        color="blue"
        className="mt-3 bg-green-400"
        type="submit"
        disabled={loading}
      >
        Save
      </button>
    )}
  </div>
);
const steps = [
  { label: "Create Chatroom", component: StepOne, active: true },
  { label: "Add Members", component: StepTwo, active: false },
  { label: "Complete", component: StepThree, active: false },
];

const AddChatroom = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [createChatroom] =
    useMutation<CreateChatroomMutation>(CREATE_CHATROOM);
  const [newlyCreatedChatroom, setNewlyCreatedChatroom] =
    useState<Chatroom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, refetch } = useQuery<SearchUsersQuery>(SEARCH_USERS, {
    variables: { fullname: searchTerm },
  });
  type SelectItem = {
    label: string
    value: string
    // other properties if required
  }
  const selectItems: SelectItem[] =
    data?.searchUsers?.map((user) => ({
      label: user.fullname,
      value: String(user.id),
    })) || []
  console.log(data, "selectItems")

  const form = useForm({
    initialValues: { name: "" },
    validate: {
      name: (value) =>
        value.trim().length >= 3 ? null : "Name must be at least 3 characters",
    },
  });


  const [addUsersToChatroom, { loading: loadingAddUsers }] =
    useMutation<AddUsersToChatroomMutation>(ADD_USERS_TO_CHATROOM, {
      refetchQueries: ["GetChatroomsForUser"],
    });

  const isCreateRoomModalOpen = useGeneralStore(
    (state) => state.isCreateRoomModalOpen
  )
  const toggleCreateRoomModal = useGeneralStore(
    (state) => state.toggleCreateRoomModal
  )
  const handleCreateChatroom = async () => {
    setActiveStep(1);
    await createChatroom({
      variables: {
        name: form.values.name,
      },
      onCompleted: (data) => {
        console.log(data);
        setNewlyCreatedChatroom(data.createChatroom);
        // complete active state stepper
      },
      onError: (error) => {
        form.setErrors({
          name: error.graphQLErrors[0].extensions?.name as string,
        });
      },
      refetchQueries: ["GetChatroomsForUser"],
    });
  };

  const handleAddUsersToChatroom = async () => {
    setActiveStep(2);
    await addUsersToChatroom({
      variables: {
        chatroomId:
          newlyCreatedChatroom?.id && parseInt(newlyCreatedChatroom?.id),
        userIds: selectedUsers.map((userId) => parseInt(userId)),
      },
      onCompleted: () => {
        toggleCreateRoomModal();
        setSelectedUsers([]);
        setNewlyCreatedChatroom(null);
        form.reset();
      },
      onError: (error) => {
        form.setErrors({
          name: error.graphQLErrors[0].extensions?.name as string,
        });
      },
    });
  };

  let debounceTimeout: NodeJS.Timeout
  const handleSearchChange = (term: string) => {

    setSearchTerm(term)

    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      refetch()
    }, 300)
  }
  const progress = (activeStep / (steps.length - 1)) * 100;
  const CurrentStep = steps[activeStep].component;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${!isCreateRoomModalOpen ? 'hidden' : ''}`}
    >

      <div className="bg-white p-6 rounded-lg shadow-lg relative flex flex-col items-start w-full max-w-lg">
        <MdClose
          className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700"
          size={24}
          onClick={toggleCreateRoomModal}
        />

        <div className="w-full mb-4">
          <div className="flex items-center mb-2 ml-28">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center justify-center">
                <div
                  className={`rounded-full h-8 w-8 flex items-center justify-center ${index <= activeStep ? 'bg-green-500' : 'bg-gray-300'} ${step ? 'bg-green-500' : 'bg-gray-300'} `}
                >
                  {index < activeStep ? (
                    <MdCheckCircle className="text-white" />
                  ) : (
                    <span className="text-white">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 ${index < activeStep ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-300 h-1 rounded-full">
            <motion.div
              className="bg-green-500 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <CurrentStep
          form={form}
          handleCreateChatroom={handleCreateChatroom}
          handleAddUsersToChatroom={handleAddUsersToChatroom}
          selectItems={selectItems}
          handleSearchChange={handleSearchChange}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          loading={loadingAddUsers}
        />

        <br />
        <button className="btn" onClick={() => setActiveStep(activeStep + 1)}>
          {activeStep === steps.length ? "Finished" : "Next"}
        </button>
      </div>
    </motion.div>
  );
};

export default AddChatroom;
