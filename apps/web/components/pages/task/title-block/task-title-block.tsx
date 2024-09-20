import { useModal, useTeamTasks } from '@app/hooks';
import { ITeamTask } from '@app/interfaces';
import { detailedTaskState } from '@app/stores';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@components/ui/hover-card';
import { useToast } from '@components/ui/use-toast';
import { Button, CopyTooltip } from 'lib/components';
import { ActiveTaskIssuesDropdown } from 'lib/features';
import Image from 'next/image';
import { CheckSimpleIcon, CopyRoundIcon } from 'assets/svg';

import Link from 'next/link';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import CreateParentTask from '../ParentTask';
import TitleLoader from './title-loader';
import { useTranslations } from 'next-intl';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { clsxm } from '@app/utils';

const TaskTitleBlock = () => {
  const { updateTitle, updateLoading } = useTeamTasks();
  const { toast } = useToast();
  const t = useTranslations();

  //DOM elements
  const titleDOM = useRef<HTMLTextAreaElement>(null);
  const saveButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  //States
  const [edit, setEdit] = useState<boolean>(false);
  const [task] = useAtom(detailedTaskState);
  const [title, setTitle] = useState<string>('');

  //Hooks and functions
  useEffect(() => {
    if (!edit) {
      task && !updateLoading && setTitle(task?.title);
    }
  }, [task, edit, updateLoading]);

  useEffect(() => {
    autoTextAreaHeight();
  }, [title]);

  useEffect(() => {
    titleDOM?.current?.focus();
  }, [edit]);

  const saveTitle = useCallback(
    (newTitle: string) => {
      if (newTitle.length > 255) {
        toast({
          variant: 'destructive',
          title: t('pages.taskDetails.TASK_TITLE_CHARACTER_LIMIT_ERROR_TITLE'),
          description: t(
            'pages.taskDetails.TASK_TITLE_CHARACTER_LIMIT_ERROR_DESCRIPTION'
          )
        });
        return;
      }

      updateTitle(newTitle, task, true);
      setEdit(false);
    },
    [task, updateTitle, toast, t]
  );

  const saveOnEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && edit) {
      saveTitle(title);
      setEdit(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        edit &&
        titleContainerRef.current &&
        !titleContainerRef.current.contains(event.target as Node)
      ) {
        saveTitle(title);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [edit, saveTitle, title]);

  const cancelEdit = () => {
    task && setTitle(task?.title);
    setEdit(false);
  };

  const autoTextAreaHeight = () => {
    titleDOM.current?.style.setProperty('height', 'auto');
    titleDOM.current?.style.setProperty(
      'height',
      titleDOM.current.scrollHeight + 'px'
    );
  };

  const handleTaskTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(event.target.value);
  };

  return (
    <div className="flex flex-col gap-[1.1875rem]" ref={titleContainerRef}>
      {task ? (
        <div className="flex gap-1">
          <textarea
            className={clsxm(
              'w-full',
              edit && 'textAreaOutline',
              'bg-transparent p-1 resize-none text-black dark:text-white not-italic font-medium text-2xl',
              'items-start outline-1 rounded-[0.1875rem] border-2 border-transparent scrollbar-hide'
            )}
            onChange={handleTaskTitleChange}
            onKeyDown={saveOnEnter}
            value={title}
            disabled={!edit}
            ref={titleDOM}
          />

          {edit ? (
            <div className="flex flex-col justify-start gap-1 transition-all">
              <button
                ref={saveButton}
                onClick={() => saveTitle(title)}
                className="border-2 dark:border-[#464242] rounded-md"
              >
                <CheckSimpleIcon
                  className="w-full max-w-[26px]"
                  strokeWidth="1.6"
                />
              </button>
              <button
                ref={cancelButton}
                onClick={cancelEdit}
                className="border-2 dark:border-[#464242] rounded-md"
              >
                <XMarkIcon className="text-[#7E7991]" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-start items-center gap-2">
              <button ref={editButton} onClick={() => setEdit(true)}>
                <Image
                  src="/assets/svg/edit-header-pencil.svg"
                  alt="edit header"
                  width={28}
                  height={28}
                  style={{ height: '28px' }}
                  className="cursor-pointer"
                />
              </button>

              <CopyTooltip text={title} defaultTooltipText="Copy Title">
                <button className="text-[#B1AEBC]">
                  <Image
                    src="/assets/svg/copy.svg"
                    alt="edit header"
                    width={17}
                    height={17}
                    style={{ height: '17px' }}
                    className="mr-1 cursor-pointer"
                  />
                </button>
              </CopyTooltip>
            </div>
          )}
        </div>
      ) : (
        <TitleLoader />
      )}

      <div className="flex flex-col items-start">
        <div className="flex flex-row items-center justify-start h-5 gap-2">
          <div className="flex flex-row gap-[0.3125rem]">
            {/* Task number */}
            <div className="bg-[#D6D6D6] rounded-[0.1875rem] text-center min-w-48 flex justify-center items-center h-5 py-[0.0625rem] px-2.5 3xl:h-6">
              <span className="text-[#293241] font-medium text-xs">
                #{task?.taskNumber}
              </span>
            </div>
            {/* Type of Issue */}
            <ActiveTaskIssuesDropdown
              key={task?.id}
              task={task}
              showIssueLabels={true}
              sidebarUI={true}
              forParentChildRelationship={true}
              taskStatusClassName="h-5 3xl:h-6 text-[0.5rem] 3xl:text-xs rounded-[0.1875rem] border-none"
            />
          </div>
          {task?.issueType !== 'Epic' && task && (
            <div className="w-[0.0625rem] h-5 bg-[#DBDBDB]"></div>
          )}

          <div className="flex flex-row gap-1">
            {/* Creator Name */}
            {/* {task?.creator && (
							<div className="bg-[#E4ECF5] rounded-[0.1875rem] text-center min-w-48 h-5 flex justify-center items-center py-[0.0625rem] px-2.5">
								<span className="text-[#538ed2] font-medium text-[0.5rem]">
									{task.creator?.name}
								</span>
							</div>
						)} */}
            {/* Parent Issue/Task Name */}

            {/* Current Issue Type is Task|Bug and Parent Issue is Not an Epic */}
            {(!task?.issueType ||
              task?.issueType === 'Task' ||
              task?.issueType === 'Bug') &&
              task?.rootEpic &&
              task?.parentId !== task?.rootEpic.id && (
                <ParentTaskBadge
                  task={{
                    ...task,
                    parentId: task?.rootEpic.id,
                    parent: task?.rootEpic
                  }}
                />
              )}

            <ParentTaskBadge task={task} />
            <ParentTaskInput task={task} />
          </div>
        </div>

        <CopyTooltip text={task?.taskNumber || ''}>
          <button className="flex gap-1 items-center text-[#B1AEBC] text-[0.5rem] 3xl:text-xs 3xl:py-2">
            <CopyRoundIcon className="text-[#B1AEBC] w-2.5 h-2.5" />
            {t('pages.settingsTeam.COPY_NUMBER')}
          </button>
        </CopyTooltip>
      </div>
    </div>
  );
};

export default TaskTitleBlock;

const ParentTaskBadge = ({ task }: { task: ITeamTask | null }) => {
  return task?.parentId && task?.parent ? (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={`/task/${task.parentId}`}
          target="_blank"
          className={clsxm(
            task.parent.issueType === 'Epic' && 'bg-[#8154BA]',
            task.parent.issueType === 'Story' && 'bg-[#54BA951A]',
            task.parent.issueType === 'Bug' && 'bg-[#C24A4A1A]',
            (task.parent.issueType === 'Task' || !task.parent.issueType) &&
              'bg-[#5483ba]',
            'rounded-[0.1875rem] text-center h-5 3xl:h-6 flex justify-center items-center py-[0.25rem] px-2.5'
          )}
        >
          <span
            className={clsxm(
              task.parent.issueType === 'Epic' && 'text-white',
              task.parent.issueType === 'Story' && 'text-[#27AE60]',
              task.parent.issueType === 'Bug' && 'text-[#C24A4A]',
              (task.parent.issueType === 'Task' || !task.parent.issueType) &&
                'text-white',
              'font-medium text-[0.5rem] 3xl:text-xs max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap'
            )}
          >
            <span
              className={clsxm(
                task.parent.issueType === 'Epic' && 'text-[#FFFFFF80]',
                task.parent.issueType === 'Story' && 'text-[#27AE6080]',
                task.parent.issueType === 'Bug' && 'text-[#C24A4A80]',
                (task.parent.issueType === 'Task' || !task.parent.issueType) &&
                  'text-white'
              )}
            >{`#${task.parent.taskNumber || task.parent.number}`}</span>
            {` - ${task.parent.title}`}
          </span>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <Link href={`/task/${task.parentId}`} target="_blank">
          <div className="flex justify-between space-x-4">
            <div className="space-y-1">
              <h4 className="text-xl font-semibold">{`#${
                task.parent.taskNumber || task.parent.number
              }`}</h4>
              <p className="text-sm">{task.parent.title}</p>
            </div>
          </div>
        </Link>
      </HoverCardContent>
    </HoverCard>
  ) : (
    <></>
  );
};
const ParentTaskInput = ({ task }: { task: ITeamTask | null }) => {
  const modal = useModal();
  const t = useTranslations();

  return task && task.issueType !== 'Epic' ? (
    <div className="box-border flex items-center justify-center h-5 text-center bg-transparent rounded cursor-pointer min-w-48 3xl:h-6">
      <Button
        variant="outline-danger"
        className="text-[#f07258] font-medium text-[0.5rem] 3xl:text-xs py-[0.25rem] px-2.5 min-w-[4.75rem] outline-none h-5 3xl:h-6 rounded-[0.1875rem]"
        onClick={modal.openModal}
      >
        {task.parentId
          ? t('common.CHANGE_PARENT')
          : `+ ${t('common.ADD_PARENT')}`}
      </Button>

      <CreateParentTask modal={modal} task={task} />
    </div>
  ) : (
    <></>
  );
};
