import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Dispatch, ReduxState } from '../../../types';
import { mapDispatchToPropsEmpty } from '../../Common/utils/reactUtils';
import styles from '../../Common/Common.scss';
import Button from '../../Common/Button/Button';
import { createNewSchema, deleteSchema } from './Schema/Actions';
import { updateCurrentSchema } from './DataActions';
import {
  getDataSourceBaseRoute,
  getSchemaPermissionsRoute,
} from '../../Common/utils/routesUtils';
import _push from './push';
import { isFeatureSupported } from '../../../dataSources';
import BreadCrumb from '../../Common/Layout/BreadCrumb/BreadCrumb';

interface Props {
  dispatch: Dispatch;
  schemaList: string[];
  currentDataSource: string;
}

const SourceView: React.FC<Props> = props => {
  const { currentDataSource, schemaList, dispatch } = props;
  const [isCreateActive, setIsCreateActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createSchemaName, setCreateSchemaName] = useState('');

  useEffect(() => {
    if (!!schemaList?.length) handleView(schemaList[0]);
    else setLoading(false);
  }, []);

  const handleCreateSchema = () => {
    const schemaName = createSchemaName;
    const successCb = () =>
      dispatch(updateCurrentSchema(schemaName, currentDataSource));

    dispatch(createNewSchema(schemaName, successCb));
  };

  const handleView = (schema: string) => {
    dispatch(updateCurrentSchema(schema, currentDataSource));
  };

  const handlePermissionsSummary = (schema: string) => {
    dispatch(_push(getSchemaPermissionsRoute(schema, currentDataSource)));
  };

  const handleDelete = (schema: string) => {
    const successCb = () => {
      dispatch(
        updateCurrentSchema('public', currentDataSource, false, schemaList)
      );
    };
    dispatch(deleteSchema(schema, successCb));
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '20px', paddingLeft: '15px' }}>Loading...</div>
    );
  }

  return (
    <div>
      <div style={{ paddingTop: '20px', paddingLeft: '15px' }}>
        <div className={styles.padd_left}>
          <Helmet title="Source - Data | Pantheon" />
          <div>
            <BreadCrumb
              breadCrumbs={[
                { url: `/data`, title: 'Data' },
                {
                  url: getDataSourceBaseRoute(currentDataSource),
                  title: currentDataSource,
                  prefix: <i className="fa fa-database" />,
                },
              ]}
            />
          </div>
          <div className={styles.display_flex}>
            <h2 className={`${styles.headerText} ${styles.display_inline}`}>
              {currentDataSource}
            </h2>
            {/* {isFeatureSupported('schemas.create.enabled') ? (
              <span>
                {!isCreateActive ? (
                  <Button
                    data-test="data-create-schema"
                    color="yellow"
                    size="sm"
                    className={styles.add_mar_left}
                    onClick={() => setIsCreateActive(true)}
                  >
                    Create Schema
                  </Button>
                ) : (
                  <div
                    className={styles.display_inline}
                    style={{ paddingLeft: '10px' }}
                  >
                    <div className={styles.display_inline}>
                      <input
                        type="text"
                        placeholder="Enter Schema name"
                        className={`form-control input-sm ${styles.display_inline}`}
                        value={createSchemaName}
                        onChange={(e: any) => {
                          e.persist();
                          setCreateSchemaName(e.target.value);
                        }}
                      />
                    </div>
                    <Button
                      data-test="data-create-schema"
                      color="yellow"
                      size="sm"
                      className={styles.add_mar_left}
                      onClick={handleCreateSchema}
                    >
                      Create Schema
                    </Button>
                    <Button
                      color="white"
                      size="xs"
                      className={styles.add_mar_left_mid}
                      onClick={() => {
                        setIsCreateActive(false);
                        setCreateSchemaName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </span>
            ) : null} */}
          </div>
          <div>
            <hr />
            <div id="schema-list-view">
              {schemaList.length ? (
                schemaList.map((schema, key: number) => {
                  return (
                    <div
                      className={`${styles.padd_small} ${styles.padd_left_remove}`}
                    >
                      <Button
                        color="white"
                        size="xs"
                        onClick={() => handleView(schema)}
                      >
                        View
                      </Button>
                      {/* <Button
                        color="white"
                        size="xs"
                        className={styles.mar_small_left}
                        onClick={() => handlePermissionsSummary(schema)}
                      >
                        Permissions Summary
                      </Button>
                      {isFeatureSupported('schemas.delete.enabled') ? (
                        <Button
                          color="white"
                          size="xs"
                          className={styles.mar_small_left}
                          onClick={() => handleDelete(schema)}
                        >
                          <i className="fa fa-trash" aria-hidden="true" />
                        </Button>
                      ) : null} */}
                      <div
                        key={key}
                        className={`${styles.display_inline} ${styles.padd_small_left}`}
                      >
                        {schema}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>There are no schemas at the moment</div>
              )}
            </div>
            <hr />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    schemaList: state.tables.schemaList,
    currentDataSource: state.tables.currentDataSource,
  };
};

const connector = connect(mapStateToProps, mapDispatchToPropsEmpty);
export default connector(SourceView);
